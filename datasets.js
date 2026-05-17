// Built-in datasets
const DATASETS = {
  iris: generateIris,
  wine: generateWine,
  diabetes: generateDiabetes
};

function generateIris() {
  const classes = ['setosa','versicolor','virginica'];
  const data = [];
  const means = [[5.0,3.4,1.5,0.2],[5.9,2.8,4.3,1.3],[6.6,3.0,5.6,2.0]];
  const stds  = [[0.35,0.38,0.17,0.1],[0.52,0.31,0.47,0.2],[0.64,0.32,0.55,0.27]];
  for(let c=0;c<3;c++){
    for(let i=0;i<50;i++){
      data.push({
        sepal_length: +(means[c][0]+randn()*stds[c][0]).toFixed(1),
        sepal_width:  +(means[c][1]+randn()*stds[c][1]).toFixed(1),
        petal_length: +(means[c][2]+randn()*stds[c][2]).toFixed(1),
        petal_width:  +(means[c][3]+randn()*stds[c][3]).toFixed(1),
        species: classes[c]
      });
    }
  }
  return {data, target:'species', taskType:'classification'};
}

function generateWine() {
  const classes = ['ClassA','ClassB','ClassC'];
  const data = [];
  const base = [[13.7,2.0,2.5,5.1,100,3.0],[12.5,1.8,2.2,4.5,85,2.5],[13.2,3.3,2.4,6.0,70,1.5]];
  const sd   = [[0.5,0.3,0.3,0.6,15,0.4],[0.6,0.4,0.3,0.5,12,0.3],[0.5,0.5,0.4,0.7,18,0.3]];
  for(let c=0;c<3;c++){
    for(let i=0;i<59;i++){
      data.push({
        alcohol:    +(base[c][0]+randn()*sd[c][0]).toFixed(1),
        malic_acid: +(base[c][1]+randn()*sd[c][1]).toFixed(1),
        ash:        +(base[c][2]+randn()*sd[c][2]).toFixed(1),
        magnesium:  +(base[c][3]+randn()*sd[c][3]).toFixed(1),
        phenols:    +Math.max(50,(base[c][4]+randn()*sd[c][4])).toFixed(0),
        flavanoids: +(base[c][5]+randn()*sd[c][5]).toFixed(2),
        quality: classes[c]
      });
    }
  }
  return {data, target:'quality', taskType:'classification'};
}

function generateDiabetes() {
  const data = [];
  for(let i=0;i<442;i++){
    const age = +(30+Math.random()*40).toFixed(0);
    const bmi = +(18+Math.random()*20).toFixed(1);
    const bp  = +(60+Math.random()*40).toFixed(0);
    const s1  = +(100+Math.random()*150).toFixed(0);
    const s2  = +(50+Math.random()*100).toFixed(0);
    const s3  = +(20+Math.random()*60).toFixed(0);
    const prog= +(25 + age*0.5 + bmi*3.5 + bp*0.3 + s1*0.1 - s3*0.4 + randn()*30).toFixed(0);
    data.push({age,bmi,blood_pressure:+bp,s1:+s1,s2:+s2,s3:+s3,progression:Math.max(25,+prog)});
  }
  return {data, target:'progression', taskType:'regression'};
}

function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
