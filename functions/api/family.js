const json=(body,status=200)=>new Response(JSON.stringify(body),{
  status,
  headers:{"content-type":"application/json; charset=UTF-8","cache-control":"no-store"}
});

async function digest(value){
  const bytes=new TextEncoder().encode(value);
  const hash=await crypto.subtle.digest("SHA-256",bytes);
  return [...new Uint8Array(hash)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
}

function cleanNames(names){
  if(!Array.isArray(names))return [];
  return names.map(name=>String(name||"").trim().slice(0,20));
}

function publicFamily(family){
  return {
    familyId:family.familyId,
    learners:(family.learners||[]).map(({name,serialNumber,displayCode})=>({name,serialNumber,displayCode}))
  };
}

export async function onRequest({request,env}){
  if(request.method!=="POST")return json({message:"Method Not Allowed"},405);
  const kv=env?.family_kv||globalThis.family_kv;
  if(!kv)return json({message:"家庭资料库尚未绑定，请联系领队。"},503);

  let body;
  try{body=await request.json()}catch{return json({message:"请求内容不正确。"},400)}
  const invite=String(body.invite||"").trim().toUpperCase();
  if(!invite)return json({message:"请输入家庭邀请码。"},400);

  const inviteHash=await digest(invite);
  const invitation=await kv.get(`invite_${inviteHash}`,{type:"json"});
  if(!invitation||invitation.status!=="active")return json({message:"家庭邀请码暂时对不上，请向领队确认。"},401);

  const familyKey=`family_${invitation.familyId}`;
  const progressKey=`progress_${invitation.familyId}`;
  const family=await kv.get(familyKey,{type:"json"});

  if(body.action==="login"){
    if(!family)return json({needsSetup:true,allowedLearners:invitation.allowedLearners});
    return json({needsSetup:false,family:publicFamily(family)});
  }

  if(body.action==="setup"){
    if(family)return json({family:publicFamily(family)});
    const names=cleanNames(body.names);
    if(names.length!==invitation.allowedLearners||names.some(name=>!name))return json({message:`这个家庭需要填写 ${invitation.allowedLearners} 位报名学员。`},400);
    const start=Number(invitation.serialStart);
    if(!Number.isInteger(start)||start<1)return json({message:"学员编号配置不正确，请联系领队。"},500);
    const created={
      familyId:invitation.familyId,
      createdAt:new Date().toISOString(),
      learners:names.map((name,index)=>{
        const serialNumber=start+index;
        return {name,serialNumber,displayCode:`天台${String(serialNumber).padStart(3,"0")}号`,status:"active"};
      })
    };
    await kv.put(familyKey,JSON.stringify(created));
    await kv.put(progressKey,JSON.stringify({completed:[],updatedAt:new Date().toISOString()}));
    return json({family:publicFamily(created)});
  }

  if(body.action==="progress:get"){
    if(!family)return json({message:"请先完成家庭报到。"},409);
    const progress=await kv.get(progressKey,{type:"json"});
    return json({completed:Array.isArray(progress?.completed)?progress.completed:[]});
  }

  if(body.action==="progress:save"){
    if(!family)return json({message:"请先完成家庭报到。"},409);
    const allowed=new Set(Array.from({length:15},(_,index)=>`m${index+1}`));
    const current=await kv.get(progressKey,{type:"json"});
    const previous=Array.isArray(current?.completed)?current.completed:[];
    const submitted=Array.isArray(body.completed)?body.completed:[];
    // 家庭成员可能使用不同手机；只合并新进度，不让较旧的设备覆盖已完成任务。
    const completed=[...new Set([...previous,...submitted].filter(id=>allowed.has(id)))];
    await kv.put(progressKey,JSON.stringify({completed,updatedAt:new Date().toISOString()}));
    return json({completed});
  }

  return json({message:"未知操作。"},400);
}
