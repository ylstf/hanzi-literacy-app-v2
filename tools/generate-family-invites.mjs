import {createHash,randomBytes} from "node:crypto";
import {readFileSync} from "node:fs";

const rosterPath=process.argv[2];
if(!rosterPath){
  console.error("Usage: node tools/generate-family-invites.mjs roster.json");
  process.exit(1);
}

const roster=JSON.parse(readFileSync(rosterPath,"utf8"));
let nextSerial=1;
const output=roster.map((family,index)=>{
  const allowedLearners=Number(family.allowedLearners);
  if(!Number.isInteger(allowedLearners)||allowedLearners<1)throw new Error(`第 ${index+1} 个家庭的报名人数不正确`);
  const invite=`TT-${randomBytes(3).toString("hex").toUpperCase()}`;
  const inviteHash=createHash("sha256").update(invite).digest("hex");
  const record={
    familyLabel:String(family.familyLabel||`家庭${index+1}`),
    invite,
    kvKey:`invite_${inviteHash}`,
    kvValue:JSON.stringify({familyId:`f${String(index+1).padStart(3,"0")}`,allowedLearners,serialStart:nextSerial,status:"active"}),
    learnerCodes:Array.from({length:allowedLearners},(_,offset)=>`天台${String(nextSerial+offset).padStart(3,"0")}号`)
  };
  nextSerial+=allowedLearners;
  return record;
});

console.log(JSON.stringify(output,null,2));
