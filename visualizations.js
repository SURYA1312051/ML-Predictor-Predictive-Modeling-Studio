// Visualization functions using Plotly
const PLOT_LAYOUT = {
  paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',
  font:{family:'Inter',color:'#9090a8',size:12},
  margin:{t:40,r:30,b:50,l:60},
  xaxis:{gridcolor:'#2a2a3a',zerolinecolor:'#2a2a3a'},
  yaxis:{gridcolor:'#2a2a3a',zerolinecolor:'#2a2a3a'}
};
const COLORS = ['#6366f1','#a855f7','#ec4899','#10b981','#f59e0b','#ef4444','#3b82f6','#14b8a6'];

function plotConfusionMatrix(elId, yTrue, yPred, labels) {
  const n=labels.length, matrix=Array.from({length:n},()=>new Array(n).fill(0));
  yTrue.forEach((t,i)=>{const ti=labels.indexOf(t),pi=labels.indexOf(yPred[i]);if(ti>=0&&pi>=0)matrix[ti][pi]++;});
  const text=matrix.map(row=>row.map(v=>''+v));
  Plotly.newPlot(elId,[{z:matrix,x:labels,y:labels,type:'heatmap',colorscale:[[0,'#12121a'],[0.5,'#4f46e5'],[1,'#a855f7']],text,texttemplate:'%{text}',textfont:{size:16,color:'#fff'},showscale:false}],
    {...PLOT_LAYOUT,title:'Confusion Matrix',xaxis:{...PLOT_LAYOUT.xaxis,title:'Predicted'},yaxis:{...PLOT_LAYOUT.yaxis,title:'Actual',autorange:'reversed'}},{responsive:true});
}

function plotROC(elId, yTrue, yScores, labels) {
  if(!labels||labels.length<2){
    Plotly.newPlot(elId,[],{...PLOT_LAYOUT,title:'ROC Curve (requires classification)',annotations:[{text:'ROC requires classification with probabilities',showarrow:false,font:{size:14,color:'#9090a8'},x:0.5,y:0.5,xref:'paper',yref:'paper'}]},{responsive:true});
    return;
  }
  const traces=[];
  labels.forEach((label,idx)=>{
    const binary=yTrue.map(v=>v===label?1:0);
    const scores=yScores.map(v=>v===label?1:0);
    const {fpr,tpr}=computeROC(binary,scores);
    const auc=computeAUC(fpr,tpr);
    traces.push({x:fpr,y:tpr,mode:'lines',name:`${label} (AUC=${auc.toFixed(2)})`,line:{color:COLORS[idx%COLORS.length],width:2}});
  });
  traces.push({x:[0,1],y:[0,1],mode:'lines',name:'Random',line:{color:'#555',dash:'dash',width:1}});
  Plotly.newPlot(elId,traces,{...PLOT_LAYOUT,title:'ROC Curve',xaxis:{...PLOT_LAYOUT.xaxis,title:'False Positive Rate',range:[0,1]},yaxis:{...PLOT_LAYOUT.yaxis,title:'True Positive Rate',range:[0,1]},legend:{font:{color:'#9090a8'}}},{responsive:true});
}

function computeROC(yTrue,scores){
  const pairs=yTrue.map((t,i)=>({t,s:scores[i]})).sort((a,b)=>b.s-a.s);
  const P=yTrue.filter(v=>v===1).length,N=yTrue.length-P;
  const fpr=[0],tpr=[0];let fp=0,tp=0;
  pairs.forEach(p=>{if(p.t===1)tp++;else fp++;fpr.push(fp/(N||1));tpr.push(tp/(P||1));});
  return {fpr,tpr};
}

function computeAUC(fpr,tpr){
  let auc=0;for(let i=1;i<fpr.length;i++)auc+=(fpr[i]-fpr[i-1])*(tpr[i]+tpr[i-1])/2;return auc;
}

function plotFeatureImportance(elId, importance) {
  const sorted=importance.sort((a,b)=>a.importance-b.importance);
  Plotly.newPlot(elId,[{y:sorted.map(d=>d.name),x:sorted.map(d=>d.importance),type:'bar',orientation:'h',marker:{color:sorted.map((_,i)=>COLORS[i%COLORS.length]),opacity:0.85}}],
    {...PLOT_LAYOUT,title:'Feature Importance',xaxis:{...PLOT_LAYOUT.xaxis,title:'Importance'},yaxis:{...PLOT_LAYOUT.yaxis,title:''}},{responsive:true});
}

function plotPredictions(elId, yTrue, yPred, isClassification) {
  if(isClassification){
    const correct=yTrue.map((t,i)=>t===yPred[i]?1:0);
    const acc=correct.filter(v=>v).length/correct.length;
    Plotly.newPlot(elId,[
      {x:yTrue.map((_,i)=>i),y:correct,type:'bar',marker:{color:correct.map(c=>c?'#10b981':'#ef4444')},name:'Correct'}
    ],{...PLOT_LAYOUT,title:`Predictions (${(acc*100).toFixed(1)}% correct)`,xaxis:{...PLOT_LAYOUT.xaxis,title:'Sample'},yaxis:{...PLOT_LAYOUT.yaxis,title:'Correct',tickvals:[0,1],ticktext:['Wrong','Right']}},{responsive:true});
  } else {
    Plotly.newPlot(elId,[
      {x:yTrue,y:yPred,mode:'markers',type:'scatter',marker:{color:'#6366f1',size:6,opacity:0.6},name:'Predictions'},
      {x:[Math.min(...yTrue),Math.max(...yTrue)],y:[Math.min(...yTrue),Math.max(...yTrue)],mode:'lines',line:{color:'#ef4444',dash:'dash'},name:'Ideal'}
    ],{...PLOT_LAYOUT,title:'Actual vs Predicted',xaxis:{...PLOT_LAYOUT.xaxis,title:'Actual'},yaxis:{...PLOT_LAYOUT.yaxis,title:'Predicted'}},{responsive:true});
  }
}

function plotRegressionMetrics(elId, yTrue, yPred) {
  const residuals=yTrue.map((t,i)=>t-yPred[i]);
  Plotly.newPlot(elId,[{x:yPred,y:residuals,mode:'markers',type:'scatter',marker:{color:'#a855f7',size:5,opacity:0.6},name:'Residuals'}],
    {...PLOT_LAYOUT,title:'Residual Plot',xaxis:{...PLOT_LAYOUT.xaxis,title:'Predicted'},yaxis:{...PLOT_LAYOUT.yaxis,title:'Residual'},shapes:[{type:'line',x0:Math.min(...yPred),x1:Math.max(...yPred),y0:0,y1:0,line:{color:'#ef4444',dash:'dash'}}]},{responsive:true});
}
