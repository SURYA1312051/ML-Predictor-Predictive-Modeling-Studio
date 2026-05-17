// App State
let state = { data:null, columns:[], target:'', features:[], algo:'linear-regression', splitRatio:0.8, maxDepth:5, nTrees:10, taskType:'auto', model:null, results:null };

document.addEventListener('DOMContentLoaded', init);

function init() {
  // Dataset cards
  document.querySelectorAll('.dataset-card[data-dataset]').forEach(card => {
    card.addEventListener('click', () => loadBuiltinDataset(card.dataset.dataset));
  });
  document.getElementById('card-upload').addEventListener('click', () => document.getElementById('csv-upload').click());
  document.getElementById('csv-upload').addEventListener('change', handleUpload);

  // Navigation
  document.getElementById('btn-change-data').addEventListener('click', () => { document.getElementById('data-preview').classList.add('hidden'); document.getElementById('dataset-grid').style.display=''; });
  document.getElementById('btn-next-configure').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-back-data').addEventListener('click', () => goToStep(1));
  document.getElementById('btn-train').addEventListener('click', trainModel);
  document.getElementById('btn-back-configure').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-new-model').addEventListener('click', () => goToStep(1));

  // Algorithm selection
  document.querySelectorAll('.algorithm-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.algorithm-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
      state.algo = opt.querySelector('input').value;
      updateParamVisibility();
    });
  });

  // Parameter sliders
  document.getElementById('split-range').addEventListener('input', e => { state.splitRatio=e.target.value/100; document.getElementById('split-value').textContent=`${e.target.value}/${100-e.target.value}`; });
  document.getElementById('depth-range').addEventListener('input', e => { state.maxDepth=+e.target.value; document.getElementById('depth-value').textContent=e.target.value; });
  document.getElementById('trees-range').addEventListener('input', e => { state.nTrees=+e.target.value; document.getElementById('trees-value').textContent=e.target.value; });

  // Feature buttons
  document.getElementById('btn-select-all').addEventListener('click', () => toggleAllFeatures(true));
  document.getElementById('btn-deselect-all').addEventListener('click', () => toggleAllFeatures(false));

  // Viz tabs
  document.querySelectorAll('.viz-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.viz-tab').forEach(t=>t.classList.remove('active'));
      document.querySelectorAll('.viz-panel').forEach(p=>p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('viz-'+tab.dataset.viz).classList.add('active');
    });
  });

  document.getElementById('select-target').addEventListener('change', e => { state.target=e.target.value; populateFeatures(); });
}

function loadBuiltinDataset(name) {
  const gen = DATASETS[name];
  if(!gen) return;
  const result = gen();
  state.data = result.data;
  state.columns = Object.keys(result.data[0]);
  state.target = result.target;
  state.taskType = result.taskType==='regression'?'regression':'auto';
  showPreview(name.charAt(0).toUpperCase()+name.slice(1));
}

function handleUpload(e) {
  const file = e.target.files[0];
  if(!file) return;
  Papa.parse(file, {
    header:true, dynamicTyping:true, skipEmptyLines:true,
    complete: result => {
      state.data = result.data.filter(row => Object.values(row).every(v => v!==null && v!==undefined && v!==''));
      state.columns = result.meta.fields;
      state.target = '';
      showPreview(file.name);
      toast('Dataset loaded: '+file.name,'success');
    },
    error: () => toast('Failed to parse CSV','error')
  });
}

function showPreview(title) {
  document.getElementById('dataset-grid').style.display='none';
  const preview = document.getElementById('data-preview');
  preview.classList.remove('hidden');
  document.getElementById('preview-title').textContent = title + ' Dataset';
  document.getElementById('preview-stats').innerHTML = `<span>📊 ${state.data.length} rows</span><span>📋 ${state.columns.length} columns</span>`;
  const thead = document.getElementById('preview-thead');
  const tbody = document.getElementById('preview-tbody');
  thead.innerHTML = '<tr>'+state.columns.map(c=>`<th>${c}</th>`).join('')+'</tr>';
  tbody.innerHTML = state.data.slice(0,15).map(row => '<tr>'+state.columns.map(c=>`<td>${row[c]}</td>`).join('')+'</tr>').join('');
}

function goToStep(step) {
  if(step===2) populateConfig();
  document.querySelectorAll('.step-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById(['','panel-data','panel-configure','panel-train','panel-results'][step]).classList.add('active');
  document.querySelectorAll('.step-indicator .step').forEach(s => {
    const n=+s.dataset.step;
    s.classList.toggle('active',n===step);
    s.classList.toggle('completed',n<step);
  });
}

function populateConfig() {
  const sel = document.getElementById('select-target');
  sel.innerHTML = '<option value="">Select target column...</option>'+state.columns.map(c=>`<option value="${c}" ${c===state.target?'selected':''}>${c}</option>`).join('');
  if(state.target) sel.value=state.target;
  populateFeatures();
  document.getElementById('select-task-type').value = state.taskType==='regression'?'regression':state.taskType==='classification'?'classification':'auto';
  updateParamVisibility();
}

function populateFeatures() {
  const list = document.getElementById('feature-list');
  const available = state.columns.filter(c=>c!==state.target);
  state.features = available.slice();
  list.innerHTML = available.map(c=>`<span class="feature-chip selected" data-feature="${c}">${c}</span>`).join('');
  list.querySelectorAll('.feature-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
      state.features = [...list.querySelectorAll('.feature-chip.selected')].map(c=>c.dataset.feature);
    });
  });
}

function toggleAllFeatures(select) {
  document.querySelectorAll('.feature-chip').forEach(c=>{select?c.classList.add('selected'):c.classList.remove('selected');});
  state.features = select ? state.columns.filter(c=>c!==state.target) : [];
}

function updateParamVisibility() {
  document.getElementById('param-max-depth').style.display = state.algo==='linear-regression'?'none':'';
  document.getElementById('param-n-trees').style.display = state.algo==='random-forest'?'':'none';
}

function detectTaskType() {
  const taskSel = document.getElementById('select-task-type').value;
  if(taskSel!=='auto') return taskSel;
  const vals = state.data.map(r=>r[state.target]);
  const unique = new Set(vals);
  if(unique.size<=10 || vals.some(v=>typeof v==='string')) return 'classification';
  return 'regression';
}

function normalize(X) {
  const n=X.length, f=X[0].length;
  const mins=new Array(f).fill(Infinity), maxs=new Array(f).fill(-Infinity);
  for(let i=0;i<n;i++) for(let j=0;j<f;j++){if(X[i][j]<mins[j])mins[j]=X[i][j];if(X[i][j]>maxs[j])maxs[j]=X[i][j];}
  return X.map(row=>row.map((v,j)=>(maxs[j]-mins[j])===0?0:(v-mins[j])/(maxs[j]-mins[j])));
}

async function trainModel() {
  if(!state.target){toast('Select a target variable','error');return;}
  if(state.features.length===0){toast('Select at least one feature','error');return;}

  goToStep(3);
  const log = document.getElementById('training-log');
  const bar = document.getElementById('progress-bar');
  const status = document.getElementById('training-status');
  log.innerHTML=''; bar.style.width='0%';

  const addLog = (msg) => { log.innerHTML+=`<div class="log-entry"><span class="log-time">${new Date().toLocaleTimeString()}</span>${msg}</div>`; log.scrollTop=log.scrollHeight; };

  await delay(300); addLog('Loading dataset...'); bar.style.width='10%'; status.textContent='Loading data...';

  const taskType = detectTaskType();
  const isClassification = taskType==='classification';

  // Encode labels for classification
  let labelMap={}, labelList=[];
  const yRaw = state.data.map(r=>r[state.target]);
  if(isClassification){
    labelList=[...new Set(yRaw)]; labelList.forEach((l,i)=>labelMap[l]=i);
  }

  const X = state.data.map(row=>state.features.map(f=>{const v=row[f];return typeof v==='number'?v:0;}));
  const y = isClassification ? yRaw : yRaw.map(v=>+v);
  const Xn = normalize(X);

  await delay(300); addLog(`Task: ${taskType} | Features: ${state.features.length}`); bar.style.width='20%';

  // Split
  const splitIdx = Math.floor(Xn.length*state.splitRatio);
  const indices = Array.from({length:Xn.length},(_,i)=>i);
  for(let i=indices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[indices[i],indices[j]]=[indices[j],indices[i]];}
  const Xtrain=indices.slice(0,splitIdx).map(i=>Xn[i]), ytrain=indices.slice(0,splitIdx).map(i=>y[i]);
  const Xtest=indices.slice(splitIdx).map(i=>Xn[i]), ytest=indices.slice(splitIdx).map(i=>y[i]);

  addLog(`Split: ${Xtrain.length} train / ${Xtest.length} test`); bar.style.width='30%'; status.textContent='Training model...';
  await delay(400);

  // Train
  let model;
  if(state.algo==='linear-regression'){
    model=new LinearRegression(); model.fit(Xtrain,ytrain.map(v=>isClassification?labelMap[v]||0:v));
    addLog('Linear Regression trained');
  } else if(state.algo==='decision-tree'){
    model=new DecisionTree(state.maxDepth,2,isClassification); model.fit(Xtrain,ytrain);
    addLog(`Decision Tree trained (depth=${state.maxDepth})`);
  } else {
    model=new RandomForest(state.nTrees,state.maxDepth,isClassification); model.fit(Xtrain,ytrain);
    addLog(`Random Forest trained (${state.nTrees} trees, depth=${state.maxDepth})`);
  }
  bar.style.width='70%'; status.textContent='Evaluating...';
  await delay(400);

  // Predict
  let predictions = model.predict(Xtest);
  if(state.algo==='linear-regression'&&isClassification){
    predictions=predictions.map(v=>{let best=labelList[0],bestD=Infinity;labelList.forEach(l=>{const d=Math.abs(v-labelMap[l]);if(d<bestD){bestD=d;best=l;}});return best;});
  }

  // Metrics
  const metrics = isClassification ? calcClassificationMetrics(ytest,predictions,labelList) : calcRegressionMetrics(ytest,predictions);
  addLog(`Evaluation complete`); bar.style.width='90%';
  await delay(300);

  state.results = {ytest,predictions,metrics,isClassification,labelList,importance:model.featureImportance(state.features)};
  bar.style.width='100%'; status.textContent='Complete!';
  addLog('✓ Model ready');
  await delay(500);

  showResults();
}

function calcClassificationMetrics(yTrue,yPred,labels) {
  const n=yTrue.length; let correct=0;
  yTrue.forEach((t,i)=>{if(t===yPred[i])correct++;});
  const accuracy=correct/n;
  const perClass={};
  labels.forEach(l=>{
    const tp=yTrue.filter((t,i)=>t===l&&yPred[i]===l).length;
    const fp=yTrue.filter((t,i)=>t!==l&&yPred[i]===l).length;
    const fn=yTrue.filter((t,i)=>t===l&&yPred[i]!==l).length;
    const precision=tp/(tp+fp)||0, recall=tp/(tp+fn)||0;
    perClass[l]={precision,recall,f1:2*precision*recall/(precision+recall)||0};
  });
  const avgF1=Object.values(perClass).reduce((s,c)=>s+c.f1,0)/labels.length;
  return {accuracy,f1:avgF1,perClass,type:'classification'};
}

function calcRegressionMetrics(yTrue,yPred) {
  const n=yTrue.length;
  let mse=0,mae=0;const yMean=yTrue.reduce((a,b)=>a+b,0)/n;let ssRes=0,ssTot=0;
  yTrue.forEach((t,i)=>{const e=t-yPred[i];mse+=e*e;mae+=Math.abs(e);ssRes+=e*e;ssTot+=(t-yMean)*(t-yMean);});
  return {mse:mse/n,rmse:Math.sqrt(mse/n),mae:mae/n,r2:1-ssRes/(ssTot||1),type:'regression'};
}

function showResults() {
  goToStep(4);
  const r=state.results, mg=document.getElementById('metrics-grid');
  if(r.isClassification){
    mg.innerHTML=metricCard('Accuracy',(r.metrics.accuracy*100).toFixed(1)+'%',r.metrics.accuracy>0.8?'good':r.metrics.accuracy>0.6?'medium':'bad')
      +metricCard('F1 Score',(r.metrics.f1*100).toFixed(1)+'%',r.metrics.f1>0.8?'good':r.metrics.f1>0.6?'medium':'bad')
      +metricCard('Test Samples',r.ytest.length,'')
      +metricCard('Classes',r.labelList.length,'');
    plotConfusionMatrix('chart-confusion',r.ytest,r.predictions,r.labelList);
    plotROC('chart-roc',r.ytest,r.predictions,r.labelList);
    // Show classification tabs
    document.getElementById('tab-confusion').style.display='';
    document.getElementById('tab-roc').style.display='';
  } else {
    mg.innerHTML=metricCard('R² Score',r.metrics.r2.toFixed(3),r.metrics.r2>0.7?'good':r.metrics.r2>0.4?'medium':'bad')
      +metricCard('RMSE',r.metrics.rmse.toFixed(2),'')
      +metricCard('MAE',r.metrics.mae.toFixed(2),'')
      +metricCard('Test Samples',r.ytest.length,'');
    plotRegressionMetrics('chart-confusion',r.ytest,r.predictions);
    document.getElementById('tab-confusion').textContent='Residuals';
    document.getElementById('tab-roc').style.display='none';
  }
  plotFeatureImportance('chart-importance',r.importance);
  plotPredictions('chart-predictions',r.ytest,r.predictions,r.isClassification);
}

function metricCard(label,value,cls){
  return `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value ${cls}">${value}</div></div>`;
}

function toast(msg,type='info'){
  const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

function delay(ms){return new Promise(r=>setTimeout(r,ms));}
