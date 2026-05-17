// ML Algorithms
class LinearRegression {
  constructor(){this.weights=[];this.bias=0;}
  fit(X,y){
    const n=X.length, f=X[0].length;
    this.weights=new Array(f).fill(0); this.bias=0;
    const lr=0.01, epochs=200;
    for(let e=0;e<epochs;e++){
      const gradW=new Array(f).fill(0); let gradB=0;
      for(let i=0;i<n;i++){
        let pred=this.bias;
        for(let j=0;j<f;j++) pred+=this.weights[j]*X[i][j];
        const err=pred-y[i]; gradB+=err;
        for(let j=0;j<f;j++) gradW[j]+=err*X[i][j];
      }
      this.bias-=lr*gradB/n;
      for(let j=0;j<f;j++) this.weights[j]-=lr*gradW[j]/n;
    }
  }
  predict(X){return X.map(row=>{let s=this.bias;for(let j=0;j<row.length;j++)s+=this.weights[j]*row[j];return s;});}
  featureImportance(names){return names.map((n,i)=>({name:n,importance:Math.abs(this.weights[i])}));}
}

class DecisionTree {
  constructor(maxDepth=5,minSize=2,isClassification=true){
    this.maxDepth=maxDepth;this.minSize=minSize;this.isClassification=isClassification;this.tree=null;
  }
  fit(X,y){this.tree=this._build(X.map((r,i)=>({x:r,y:y[i]})),0);}
  _build(data,depth){
    if(depth>=this.maxDepth||data.length<=this.minSize||new Set(data.map(d=>d.y)).size===1)
      return {leaf:true,value:this.isClassification?mode(data.map(d=>d.y)):mean(data.map(d=>d.y)),count:data.length};
    let bestGain=-Infinity,bestFeat=0,bestThresh=0;
    const nFeat=data[0].x.length;
    for(let f=0;f<nFeat;f++){
      const vals=[...new Set(data.map(d=>d.x[f]))].sort((a,b)=>a-b);
      for(let t=0;t<vals.length-1;t++){
        const thresh=(vals[t]+vals[t+1])/2;
        const left=data.filter(d=>d.x[f]<=thresh), right=data.filter(d=>d.x[f]>thresh);
        if(left.length===0||right.length===0)continue;
        const gain=this._infoGain(data,left,right);
        if(gain>bestGain){bestGain=gain;bestFeat=f;bestThresh=thresh;}
      }
    }
    if(bestGain<=0) return {leaf:true,value:this.isClassification?mode(data.map(d=>d.y)):mean(data.map(d=>d.y)),count:data.length};
    const left=data.filter(d=>d.x[bestFeat]<=bestThresh);
    const right=data.filter(d=>d.x[bestFeat]>bestThresh);
    return {leaf:false,feature:bestFeat,threshold:bestThresh,left:this._build(left,depth+1),right:this._build(right,depth+1)};
  }
  _infoGain(parent,left,right){
    const n=parent.length;
    if(this.isClassification){
      return gini(parent.map(d=>d.y))-(left.length/n)*gini(left.map(d=>d.y))-(right.length/n)*gini(right.map(d=>d.y));
    } else {
      return variance(parent.map(d=>d.y))-(left.length/n)*variance(left.map(d=>d.y))-(right.length/n)*variance(right.map(d=>d.y));
    }
  }
  predict(X){return X.map(row=>this._traverse(row,this.tree));}
  _traverse(row,node){
    if(node.leaf)return node.value;
    return row[node.feature]<=node.threshold?this._traverse(row,node.left):this._traverse(row,node.right);
  }
  featureImportance(names){
    const imp=new Array(names.length).fill(0);
    this._calcImp(this.tree,imp);
    const total=imp.reduce((a,b)=>a+b,0)||1;
    return names.map((n,i)=>({name:n,importance:imp[i]/total}));
  }
  _calcImp(node,imp){if(!node||node.leaf)return;imp[node.feature]++;this._calcImp(node.left,imp);this._calcImp(node.right,imp);}
}

class RandomForest {
  constructor(nTrees=10,maxDepth=5,isClassification=true){
    this.nTrees=nTrees;this.maxDepth=maxDepth;this.isClassification=isClassification;this.trees=[];
  }
  fit(X,y){
    this.trees=[];
    for(let t=0;t<this.nTrees;t++){
      const indices=Array.from({length:X.length},()=>Math.floor(Math.random()*X.length));
      const Xb=indices.map(i=>X[i]),yb=indices.map(i=>y[i]);
      const tree=new DecisionTree(this.maxDepth,2,this.isClassification);
      tree.fit(Xb,yb);
      this.trees.push(tree);
    }
  }
  predict(X){
    const preds=this.trees.map(t=>t.predict(X));
    return X.map((_,i)=>{
      const vals=preds.map(p=>p[i]);
      return this.isClassification?mode(vals):mean(vals);
    });
  }
  featureImportance(names){
    const combined=names.map(()=>0);
    this.trees.forEach(t=>{
      const imp=t.featureImportance(names);
      imp.forEach((v,i)=>combined[i]+=v.importance);
    });
    const total=combined.reduce((a,b)=>a+b,0)||1;
    return names.map((n,i)=>({name:n,importance:combined[i]/total}));
  }
}

function gini(y){const counts={};y.forEach(v=>counts[v]=(counts[v]||0)+1);let s=0;const n=y.length;Object.values(counts).forEach(c=>s+=(c/n)*(c/n));return 1-s;}
function variance(y){const m=mean(y);return y.reduce((s,v)=>s+(v-m)*(v-m),0)/y.length;}
function mean(a){return a.reduce((s,v)=>s+v,0)/a.length;}
function mode(a){const c={};a.forEach(v=>c[v]=(c[v]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0];}
