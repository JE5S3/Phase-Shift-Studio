import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {PGlite} from '@electric-sql/pglite';
const admin='11111111-1111-4111-8111-111111111111';
const outsider='22222222-2222-4222-8222-222222222222';
test('actual PostgreSQL SQL: public reads; only allowlisted admins save; no self-promotion',async()=>{
  const db=new PGlite();
  try{
    await db.exec(`
      create role anon;create role authenticated;
      create schema auth;grant usage on schema auth to anon,authenticated;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
      $$;
      insert into auth.users values('${admin}'),('${outsider}');
    `);
    await db.exec(await readFile('supabase/schema.sql','utf8'));
    await db.exec(await readFile('supabase/seed.sql','utf8'));
    await db.exec(await readFile('supabase/seed.sql','utf8')); // reruns must preserve saved fields
    await db.exec(`insert into public.website_admins(user_id) values('${admin}')`);
    async function identity(role,uid=''){
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)",[uid]);
      await db.exec('set role '+role);
    }
    async function save(revision,changes){
      return (await db.query('select public.save_website_content($1,$2::jsonb) as saved',[revision,JSON.stringify(changes)])).rows[0].saved;
    }
    async function snapshot(){return (await db.query('select public.read_website_content() as snapshot')).rows[0].snapshot;}
    await identity('anon');
    const initial=await snapshot();assert.equal(initial.values['pricing.monthly.landing.price'],99);
    assert.equal(typeof initial.values['pricing.monthly.landing.price'],'number');
    for(const query of [
      "update public.website_content set content_value='0'::jsonb",
      "delete from public.website_content",
      "insert into public.website_content(section,content_key,content_type,content_value) values('x','x','text','\"x\"')",
      "select * from public.website_admins",
      "update public.website_content_state set revision=100",
      "select public.save_website_content(0,'{}')"
    ])await assert.rejects(db.exec(query),/permission denied/);
    await identity('authenticated',outsider);
    assert.equal((await db.query('select * from public.website_admins')).rows.length,0);
    await assert.rejects(save(0,{'pricing.monthly.landing.price':1}),/NOT_AUTHORISED/);
    await assert.rejects(db.exec(`insert into public.website_admins(user_id) values('${outsider}')`),/permission denied/);
    await assert.rejects(db.exec("update public.website_content set content_value='0'::jsonb"),/permission denied/);
    await identity('authenticated',admin);
    assert.equal((await db.query('select * from public.website_admins')).rows.length,1);
    const saved=await save(0,{'pricing.monthly.landing.price':123.29});
    assert.equal(saved.revision,1);assert.equal(saved.values['pricing.monthly.landing.price'],123.29);
    await assert.rejects(save(0,{'pricing.monthly.landing.price':5}),/CONTENT_CONFLICT/);
    await assert.rejects(save(1,{'pricing.monthly.landing.price':-1}),/INVALID_PRICE/);
    await assert.rejects(save(1,{'pricing.monthly.landing.price':'123'}),/INVALID_PRICE/);
    await assert.rejects(save(1,{'pricing.monthly.landing.price':1.001}),/INVALID_PRICE/);
    await assert.rejects(save(1,{'pricing.monthly.landing.price':200,'unknown.key':'bad'}),/UNKNOWN_CONTENT_FIELD/);
    assert.equal((await snapshot()).values['pricing.monthly.landing.price'],123.29); // all-or-nothing
    assert.equal((await snapshot()).revision,1);
    const textKey=Object.keys(saved.values).find(k=>k.startsWith('hero.intro.'));
    await assert.rejects(save(1,{[textKey]:''}),/INVALID_TEXT/);
    await assert.rejects(save(1,{[textKey]:'x'.repeat(2001)}),/INVALID_TEXT/);
    await assert.rejects(save(1,{[textKey]:'bad\u0001text'}),/INVALID_TEXT/);
    const next=await save(1,{[textKey]:'Updated copy.'});
    await identity('anon');assert.equal((await snapshot()).values[textKey],'Updated copy.');
    await identity('authenticated',admin);
    await db.exec('reset role');await db.exec(`delete from public.website_admins where user_id='${admin}'`);
    await identity('authenticated',admin);
    await assert.rejects(save(next.revision,{[textKey]:'Not allowed'}),/NOT_AUTHORISED/);
  }finally{await db.close();}
});
