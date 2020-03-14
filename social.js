
var version = '6.0';

// globals

var gt      = 1000.0;                 // population
var gs      = 999.0;                  // suscpetibles
var gi      = 1.0;                    // infected
var gp      = 600.0;                  // max prevalence
var gcmax   = 0.6;                    // max contact rate (first curve)
var gcmin   = 0.2;                    // min contact rate (slider)
var gcgov   = 0.04;                   // intervention contact rate
var gigov   = 20;                     // intervention iterations
var gk      = 0.1;                    // recovery rate
var gz      = 160;                    // model iterations
var gres    = 100;                    // slider resolution
var gcrate  = (gcmax - gcmin) / gres; // scaling factor for contact rate slider
var gpeak   = 0;                      // the peak of the second curve 
var gh      = 50;                     // healthcare threshold - probably way less than this in reality
var gx      = 480;                    // canvas width
var gy      = 200;                    // canvas height
var gw      = 3;                      // line width

var gColOverload  = "#DB5F40";
var gColCapacity  = "#A8D49A";
var gColCurve1    = "#FFFFFF";
var gColCurve2    = "#FFFFFF";
var gColCurve3    = "#FFFFFF";
  
function px(x) {
  return x * gx/gz;
}

function py (y) {
  return gy - y * gy/gp - gw;
}

//  funcs

function sir1() {

  var ss = gs;
  var ii = gi;
  var rr = gt - ss - ii;
  
  ctx.fillStyle = gColOverload;
  ctx.fillRect(0,0,gx,gy-gh);

  ctx.fillStyle = gColCapacity;
  ctx.fillRect(0,gy-gh,gx,gh);

  ctx.beginPath();

  ctx.strokeStyle = gColCurve1;
  ctx.lineWidth   = gw;

  ctx.setLineDash([3,5]);
  ctx.moveTo(px(0),py(ii));

  for (var i=1; i<gz; i++) {

    var sf = ss / gt;
  
    var infected = gcmax * sf * ii;

    var ssa = ss - infected;
    var iia = ii + infected - gk * ii;
    var rra = rr + gk * ii;

    ss = ssa;
    ii = iia;
    rr = rra;

    ctx.lineTo(px(i),py(ii));
  }

  ctx.stroke();
}

function sir2() {

  gpeak = 0;

  var ss = gs;
  var ii = gi;
  var rr = gt - ss - ii;

  ctx.beginPath();

  ctx.strokeStyle = gColCurve2;
  ctx.lineWidth   = gw;

  ctx.setLineDash([2,3]);
  ctx.moveTo(px(0),py(ii));

  for (var i=1; i<gz; i++) {

    var lastii   = ii;
    var sf       = ss / gt;
    var infected = gcmin * sf * ii;

    var ssa = ss - infected;
    var iia = ii + infected - gk * ii;
    var rra = rr + gk * ii;

    ss = ssa;
    ii = iia;
    rr = rra;

    if (!gpeak && ii < lastii) {
      gpeak = i;  
    }

    ctx.lineTo(px(i),py(ii));
  }

  ctx.stroke();
}

function sir3() {

  var ss = gs;
  var ii = gi;
  var rr = gt - ss - ii;
  var cc = 0.0;

  ctx.beginPath();
  
  ctx.strokeStyle = gColCurve3;
  ctx.lineWidth   = gw;

  ctx.setLineDash([]);
  ctx.moveTo(px(0),py(ii));

  for (var i=1; i<gz; i++) {

    var sf = ss / gt;

    if ((islide != gpeak) && (i > islide) && (i < gpeak + gigov)) 
      cc = gcgov; 
    else 
      cc = gcmin;

    var infected = cc * sf * ii;

    var ssa = ss - infected;
    var iia = ii + infected - gk * ii;
    var rra = rr + gk * ii;

    ss = ssa;
    ii = iia;
    rr = rra;

    ctx.lineTo(px(i),py(ii));
  }

  ctx.stroke();
}

var dslide      = 0;  // social distancing slider
var islide      = 0;  // social intervention slider
var islideCache = 0;

var canvas = 0;
var ctx    = 0;

function islideUpdate() {
  islide = gpeak - islideCache * gpeak / gres | 0;
}

function gcminUpdate() {
  gcmin  = gcmax - dslide * gcrate;
}

$(function() {

  gcminUpdate();

  $('#ver').html(version);

  canvas = document.getElementById("graphs");
  ctx    = canvas.getContext("2d");

  $('#dslider').on('input', function (e) {
    dslide = parseInt($('#dslider').val());
    gcminUpdate();
    sir1()
    sir2();
    islideUpdate(); 
    sir3();
  });

  $('#islider').on('input', function (e) {
    sir1()
    sir2();
    islideCache = parseInt($('#islider').val());
    islideUpdate();
    sir3();
  });

  sir1();
  sir2();
  islide = gpeak;
  sir3();

});



