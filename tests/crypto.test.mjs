import test from 'node:test';
import assert from 'node:assert/strict';
import {identity,signedEvent,validEvent,newCircleKey,aesEncrypt,aesDecrypt,dmKey,encryptedBackup,restoreBackup,sign,verify,packJson,unpackJson} from '../src/secure.js';

test('locally generated identity signs events and detects tampering',async()=>{
 const alice=await identity();const ev=await signedEvent({id:'post1',time:1,type:'post',circleId:'c1',authorName:'Alice',text:'Hello!'},alice);
 assert.equal(await validEvent(ev),true);
 assert.equal(await validEvent({...ev,text:'Changed!'}),false);
});
test('circle AES-GCM encrypts and rejects wrong key',async()=>{
 const secret=newCircleKey(),data={events:[{text:'A post',images:[]}]};
 const envelope=await aesEncrypt(data,secret);
 assert.equal(envelope.data.includes('A post'),false);
 assert.deepEqual(await aesDecrypt(envelope,secret),data);
 await assert.rejects(()=>aesDecrypt(envelope,newCircleKey()));
});
test('independent DM ECDH keys match on both devices',async()=>{
 const alice=await identity(),bob=await identity();
 const keyA=await dmKey(alice.ecdhPrivate,bob.ecdhPub),keyB=await dmKey(bob.ecdhPrivate,alice.ecdhPub);
 assert.equal(keyA,keyB);
 assert.deepEqual(await aesDecrypt(await aesEncrypt({text:'Private hello'},keyA),keyB),{text:'Private hello'});
});
test('signed invitation can be verified and tampering invalidates signature',async()=>{
 const alice=await identity();const invite={v:1,id:'circle',name:'Friends',key:newCircleKey(),actorId:alice.id,authorPublic:alice.signPub,exp:Date.now()+10000};
 const sig=await sign(invite,alice);
 const packed=packJson({...invite,sig});const {sig:signed,...unpacked}=unpackJson(packed);
 assert.equal(await verify(unpacked,signed,unpacked.authorPublic),true);
 assert.equal(await verify({...unpacked,name:'Changed'},signed,unpacked.authorPublic),false);
});
test('backup restores data only with correct password',async()=>{
 const state={profile:{name:'Alice'},events:[],circles:[{name:'Friends'}]};const backup=await encryptedBackup(state,'a long private passphrase');
 assert.deepEqual(await restoreBackup(backup,'a long private passphrase'),state);
 await assert.rejects(()=>restoreBackup(backup,'incorrect password'));
});
