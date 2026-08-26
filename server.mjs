import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_META, BUILD_SETS, CTEST_SETS, DISCUSSION_TASKS, EMAIL_TASKS } from './src/data.js';
import { READING_FORMS } from './src/reading-data.js';
import { SUPPLEMENTAL_ACADEMIC_BANK, SUPPLEMENTAL_DAILY_BANK } from './src/focused-reading-data.js';
import { buildCoverageReport, collectReadingContent } from './src/content-intelligence.js';
import { OFFICIAL_SOURCE_REGISTRY } from './src/official-sources.js';
import { FORM_BLUEPRINT, SOURCE_POLICY, TASK_BLUEPRINTS } from './src/blueprints.js';
import { stimulusOverlap } from './src/scoring.js';
import { callProviderJson, providerStatus } from './server/provider.mjs';
import { validateGenerated } from './server/validation.mjs';
import { adjudicationSystemPrompt, generationSystemPrompt, generationUserPrompt, gradingSystemPrompt, gradingUserPrompt, verifierSystemPrompt, GRADER_VERSION, GENERATOR_VERSION } from './server/prompts.mjs';

const ROOT=resolve(fileURLToPath(new URL('.',import.meta.url))),PORT=Number(process.env.PORT||4173),HOST=process.env.HOST||'127.0.0.1',MAX_BODY=1_000_000;
const READING_CONTENT=collectReadingContent(READING_FORMS);
const DAILY_BANK=[...READING_CONTENT.daily,...SUPPLEMENTAL_DAILY_BANK].filter((item,index,list)=>list.findIndex((candidate)=>candidate.id===item.id)===index);
const ACADEMIC_BANK=[...READING_CONTENT.academic,...SUPPLEMENTAL_ACADEMIC_BANK].filter((item,index,list)=>list.findIndex((candidate)=>candidate.id===item.id)===index);
const CONTENT_REPORT=buildCoverageReport({ctestSets:CTEST_SETS,readingForms:READING_FORMS,buildSets:BUILD_SETS,emailTasks:EMAIL_TASKS,discussionTasks:DISCUSSION_TASKS,focusedDaily:SUPPLEMENTAL_DAILY_BANK,focusedAcademic:SUPPLEMENTAL_ACADEMIC_BANK});
const GENERATABLE_TYPES=['ctw','daily','academic','build','email','discussion'];

const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.md':'text/markdown; charset=utf-8'};
function json(res,status,payload){const body=JSON.stringify(payload);res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Content-Length':Buffer.byteLength(body),'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(body);}
async function readBody(req){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw Object.assign(new Error('Request body too large.'),{status:413});chunks.push(chunk);}const text=Buffer.concat(chunks).toString('utf8');if(!text)return{};try{return JSON.parse(text);}catch{throw Object.assign(new Error('Request body must be valid JSON.'),{status:400});}}
function intScore(v){const n=Math.round(Number(v));return Number.isFinite(n)&&n>=0&&n<=5?n:null;}
function pick(items){return items[Math.floor(Math.random()*items.length)];}
function localGenerated(type){if(type==='ctw')return validateGenerated(type,pick(CTEST_SETS),{allowCuratedCtw:true});if(type==='daily')return validateGenerated(type,pick(DAILY_BANK));if(type==='academic')return validateGenerated(type,pick(ACADEMIC_BANK));if(type==='build')return validateGenerated(type,pick(BUILD_SETS));if(type==='email')return validateGenerated(type,pick(EMAIL_TASKS));return validateGenerated(type,pick(DISCUSSION_TASKS));}
function words(text){return(String(text).toLowerCase().match(/\b[a-z]{3,}\b/g)||[]);}
function gramSet(text,n=5){const w=words(text),out=new Set();for(let i=0;i<=w.length-n;i++)out.add(w.slice(i,i+n).join(' '));return out;}
function jaccard(a,b){if(!a.size&&!b.size)return 0;let hit=0;for(const x of a)if(b.has(x))hit++;return hit/(a.size+b.size-hit||1);}
function candidateText(type,item){if(type==='ctw')return item.sourceText||'';if(type==='daily'||type==='academic')return[item.title,item.label,item.text,...(item.questions||[]).map(q=>[q.stem,...(q.options||[]).map(o=>o.text)].join(' '))].join(' ');if(type==='build')return(item.items||[]).map(x=>[x.promptA,x.prefix,x.suffix,...(x.choices||[]).map(c=>c.text)].join(' ')).join(' ');if(type==='email')return[item.scenario,...(item.goals||[])].join(' ');return[item.question,...(item.students||[]).map(s=>s.post)].join(' ');}
function bankItems(type){if(type==='ctw')return CTEST_SETS;if(type==='daily')return DAILY_BANK;if(type==='academic')return ACADEMIC_BANK;if(type==='build')return BUILD_SETS;if(type==='email')return EMAIL_TASKS;return DISCUSSION_TASKS;}
function duplicateScore(type,item){const cand=gramSet(candidateText(type,item));return Math.max(0,...bankItems(type).map(x=>jaccard(cand,gramSet(candidateText(type,x)))));}
async function handleGenerate(req,res){const body=await readBody(req),type=GENERATABLE_TYPES.includes(body.taskType)?body.taskType:null;if(!type)return json(res,400,{error:`taskType must be one of: ${GENERATABLE_TYPES.join(', ')}.`});if((body.provider||process.env.LLM_PROVIDER||'local')==='local')return json(res,200,{source:'local_bank',item:localGenerated(type),generatorVersion:GENERATOR_VERSION});
 let lastError=null;for(let attempt=1;attempt<=3;attempt++){try{const raw=await callProviderJson({provider:body.provider,model:body.generatorModel||body.model,system:generationSystemPrompt(type),user:generationUserPrompt(body),temperature:Number.isFinite(body.temperature)?body.temperature:.55});const item=validateGenerated(type,raw);const dup=duplicateScore(type,item);if(dup>=.55)throw new Error(`Near-duplicate score ${dup.toFixed(2)} is too high.`);let verifier={pass:true,quality:null,issues:[],revision_note:'verifier not configured'};const verifierModel=body.verifierModel||body.generatorModel||body.model;if(body.verify!==false){verifier=await callProviderJson({provider:body.provider,model:verifierModel,system:verifierSystemPrompt(type),user:JSON.stringify(item),temperature:0});if(verifier.pass===false)throw new Error(`Verifier rejected item: ${(verifier.issues||[]).join('; ')}`);}return json(res,200,{source:'provider',item,verifier,duplicateScore:dup,attempts:attempt,generatorVersion:GENERATOR_VERSION});}catch(e){lastError=e;}}
 throw Object.assign(new Error(`Question generation failed quality gates after 3 attempts: ${lastError?.message||'unknown error'}`),{status:422});
}
function cleanEvidence(evidence,response){return(Array.isArray(evidence)?evidence:[]).slice(0,6).filter(e=>e&&typeof e.quote==='string'&&e.quote.length>0&&response.includes(e.quote)).map(e=>({quote:e.quote,reason:String(e.reason||'')}));}
function normalizeGrade(payload,response){const score=intScore(payload.score??payload.holistic_0_5);if(score==null)throw new Error('Rater returned an invalid score.');const dims=payload.dimensions&&typeof payload.dimensions==='object'?Object.fromEntries(Object.entries(payload.dimensions).map(([k,v])=>[k,Number.isFinite(Number(v))?Math.max(0,Math.min(5,Number(v))):null])):{};return{score,summary:String(payload.summary||''),diagnostics:Array.isArray(payload.diagnostics)?payload.diagnostics.slice(0,8).map(String):[],dimensions:dims,evidence:cleanEvidence(payload.evidence,response),prompt_borrowing:payload.prompt_borrowing||null,confidence:Math.max(0,Math.min(1,Number(payload.confidence)||0))};}
async function handleGrade(req,res){const body=await readBody(req);if(!['email','discussion'].includes(body.taskType))return json(res,400,{error:'taskType must be email or discussion.'});if(typeof body.response!=='string')return json(res,400,{error:'response must be a string.'});if(!body.response.trim())return json(res,200,{score:0,source:'rule_zero',summary:'Blank response.',diagnostics:['No response was submitted.'],evidence:[],dimensions:{},confidence:1,graderVersion:GRADER_VERSION});
 const status=providerStatus(body.provider,body.model);if(!status.configured)return json(res,503,{error:'The requested provider is not configured on the server.',...status});const user=gradingUserPrompt(body);const [aRaw,bRaw]=await Promise.all([callProviderJson({provider:body.provider,model:body.graderModelA||body.model,system:gradingSystemPrompt(body.taskType,'rubric_first'),user,temperature:0}),callProviderJson({provider:body.provider,model:body.graderModelB||body.model,system:gradingSystemPrompt(body.taskType,'skeptical'),user,temperature:0})]);const grades=[normalizeGrade(aRaw,body.response),normalizeGrade(bRaw,body.response)];const overlap=stimulusOverlap(body.response,body.taskType==='discussion'?[body.task?.question,...(body.task?.students||[]).map(s=>s.post)].join(' '):body.task?.scenario||'');
 if(Math.abs(grades[0].score-grades[1].score)>=1){const raw=await callProviderJson({provider:body.provider,model:body.adjudicatorModel||body.model,system:adjudicationSystemPrompt(body.taskType),user:`${user}\n\nRATER A:\n${JSON.stringify(grades[0])}\n\nRATER B:\n${JSON.stringify(grades[1])}`,temperature:0});return json(res,200,{...normalizeGrade(raw,body.response),source:'llm_adjudicated',adjudicated:true,graders:grades,stimulusOverlap:overlap,graderVersion:GRADER_VERSION});}
 const chosen=grades[0].confidence>=grades[1].confidence?grades[0]:grades[1];return json(res,200,{...chosen,source:'llm_dual',adjudicated:false,graders:grades,stimulusOverlap:overlap,graderVersion:GRADER_VERSION});
}
async function serveStatic(req,res,pathname){
 const requested=pathname==='/'?'/index.html':pathname;
 const decoded=decodeURIComponent(requested);
 const filePath=resolve(ROOT,`.${decoded}`);
 const rel=relative(ROOT,filePath);
 if(!rel||rel.startsWith('..')||isAbsolute(rel))return json(res,403,{error:'Forbidden.'});
 try{
  const info=await stat(filePath);if(!info.isFile())throw 0;
  const content=await readFile(filePath);
  res.writeHead(200,{'Content-Type':MIME[extname(filePath)]||'application/octet-stream','Content-Length':content.length,'Cache-Control':extname(filePath)==='.html'?'no-cache':'public, max-age=300','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http: https:; img-src 'self' data:; font-src 'self'; base-uri 'self'; form-action 'self'"});
  if(req.method==='HEAD')res.end();else res.end(content);
 }catch{json(res,404,{error:'Not found.'});}
}
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url||'/',`http://${req.headers.host||`${HOST}:${PORT}`}`);if(req.method==='GET'&&url.pathname==='/api/health'){const requested=url.searchParams.get('provider')||process.env.LLM_PROVIDER||'openai-compatible',model=url.searchParams.get('model')||undefined;return json(res,200,{ok:true,app:'TOEFL 2026 Practice Lab',appVersion:APP_META.version,graderVersion:GRADER_VERSION,generatorVersion:GENERATOR_VERSION,...providerStatus(requested,model)});}if(req.method==='POST'&&url.pathname==='/api/generate')return await handleGenerate(req,res);if(req.method==='POST'&&url.pathname==='/api/grade')return await handleGrade(req,res);if(req.method==='GET'&&url.pathname==='/api/content/coverage')return json(res,200,CONTENT_REPORT);if(req.method==='GET'&&url.pathname==='/api/content/sources')return json(res,200,{version:CONTENT_REPORT.sourceRegistryVersion,sources:OFFICIAL_SOURCE_REGISTRY,policy:SOURCE_POLICY});if(req.method==='GET'&&url.pathname==='/api/content/blueprints')return json(res,200,{tasks:TASK_BLUEPRINTS,form:FORM_BLUEPRINT});if(req.method==='GET'||req.method==='HEAD')return await serveStatic(req,res,url.pathname);json(res,405,{error:'Method not allowed.'});}catch(e){console.error(e);json(res,e.status||500,{error:e.message||'Internal server error.'});}});
server.listen(PORT,HOST,()=>{console.log(`TOEFL 2026 Practice Lab v${APP_META.version}: http://${HOST}:${PORT}`);console.log(`Provider: ${JSON.stringify(providerStatus(process.env.LLM_PROVIDER||'openai-compatible'))}`);});
