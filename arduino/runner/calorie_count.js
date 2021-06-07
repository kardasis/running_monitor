var x,y,z,d,m,x0,cal,y_00,d_00,m_00,ymp0,y0;

function check_data() {

check=true;

x=document.f.x.value;  //x...deg(%)
y=document.f.y.value;  //y...v(km/h)
z=document.f.z.value;  //z...time(min)
d=document.f.d.value;  //d...distance(km)
m=document.f.m.value;  //m...weight(kg)

//ycheck=document.getElementById("y0").value;
//dcheck=document.getElementById("d0").value;
//mcheck=document.getElementById("m0").value;
//ycheck=document.f.y0.value; //mph or kmh
//dcheck=document.f.d0.value; //m or k
//mcheck=document.f.m0.value; //lbs or Kg

if (x=="") { x=0 } ;
if (y=="") { y=0 } ;
if (z=="") { z=0 } ;
if (d=="") { d=0 } ;
if (m=="") { m=0 } ;

x=eval(x);
y=eval(y);
z=eval(z);
d=eval(d);
m=eval(m);

if(x<-0.001){
	alert("Please input the gradient above 0.");
        check=false;
        document.f.x.focus();
	   }
if(y<0){
	alert("Please input the speed above 0.");
        check=false;
        document.f.y.focus();
	   }
if(z<0){
	alert("Please input the running-time(min) above 0.");
        check=false;
        document.f.z.focus();
	   }
if(d<0){
	alert("Please input the running-distance(Mile/Km) above 0.");
        check=false;
        document.f.d.focus();
	   }
if(m<0){
	alert("Please input the weigh(lbs/Kg) above 0.");
        check=false;
        document.f.m.focus();
	   }
if((d != 0)&&(z != 0)&&(y != 0)){
	alert("Speed, Time, and the Distance cannot be specified at the same time.");
        check=false;
        document.f.d.focus();
	   }


       if (check==true) { calc(); }
}

function calc(){

//y=jpn :: y_00=eng
if (document.f.y000[0].checked){y_00=y;y=y*1.61;}else{y=y;y_00=y/1.61;}
if (document.f.d000[0].checked){d_00=d;d=d*1.61;}else{d=d;d_00=d/1.61;}
if (document.f.m000[0].checked){m_00=m;m=m*0.454;}else{m=m;m_00=m/0.454;}

if ((y == 0) && (z != 0)){y=d/z*60;y_00=y/1.61;}  //y...v(km/h)
if ((z == 0) && (y != 0)){z=d/y*60;}  //z...time(min)
if (d == 0){d=y*z/60;d_00=d/1.61;}  //d...distance(km)


y0=y+y*x*9/200;
ymp0=y_00+y_00*x*9/200;

z0=z;
d0=y0*z/60;
dm0=ymp0*z/60;

cal=(y0*1000/60+17.5)*z*m/1000 ;
fat=cal/7/2;
fatoz=fat/28.3495;
mets=cal/m/z*60;
kj=4.184*cal;
kw=kj/3600;
stb=60*kw;
dnk=kw*10;
rice=cal/252;
beer=cal/203;
shop=cal/2.5;
clean=cal/3.8;

cburger=cal/310;
beer2=cal/153.1;
cleanning=cal/1.59/m_00*60;


s100=360/y0;  		//100m for sec

m10k=Math.floor(600/y0);		//10K for min
s10k=((600/y0)-m10k)*60;


m21k=21.095*60/y0;	//Half for min

m21kh=Math.floor(m21k/60);
m21km=Math.floor(m21k-m21kh*60);
m21ks=((m21k-m21kh*60)-m21km)*60;

m42k=42.195*60/y0;	//Full for min
m42kh=Math.floor(m42k/60);
m42km=Math.floor(m42k-m42kh*60);
m42ks=((m42k-m42kh*60)-m42km)*60;
myrecord=m42k/60;
//alert(myrecord);
record=2.0275/myrecord*100; //record 2:01:39

document.f.xx.value=Math.round(x*10)/10;
document.f.yymph.value=Math.round(y_00*10)/10;
document.f.yy.value=Math.round(y*10)/10;
document.f.zz.value=Math.round(z*10)/10;
document.f.ddm.value=Math.round(d_00*10)/10;
document.f.dd.value=Math.round(d*10)/10;
document.f.ymp0.value=Math.round(ymp0*10)/10;
document.f.y0.value=Math.round(y0*10)/10;
document.f.cal.value=Math.round(cal*10)/10;
document.f.z0.value=Math.round(z0*10)/10;
document.f.dm0.value=Math.round(dm0*10)/10;
document.f.d0.value=Math.round(d0*10)/10;
document.f.fatoz.value=Math.round(fatoz*10)/10;
document.f.fat.value=Math.round(fat*10)/10;
document.f.mets.value=Math.round(mets*10)/10;
document.f.kw.value=Math.round(kw*10)/10;
document.f.stb.value=Math.round(stb*10)/10;
document.f.dnk.value=Math.round(dnk*10)/10;
document.f.cburger.value=Math.round(cburger*10)/10;
document.f.beer2.value=Math.round(beer2*10)/10;
document.f.shop.value=Math.round(shop*10)/10;
document.f.cleanning.value=Math.round(cleanning*10)/10;
document.f.s100.value=Math.round(s100*10)/10;
document.f.m10k.value=m10k;
document.f.s10k.value=Math.round(s10k*10)/10;
document.f.m21kh.value=m21kh;
document.f.m21km.value=m21km;
document.f.m21ks.value=Math.round(m21ks*10)/10;
document.f.m42kh.value=m42kh;
document.f.m42km.value=m42km;
document.f.m42ks.value=Math.round(m42ks*10)/10;
document.f.record.value=Math.round(record*10)/10;

var twitter_hour,twitter_cal,twitter_credit;

if (document.f.x.value==0){
	twitter_angle = "";
	}else{
	twitter_angle = "( "+document.f.xx.value+" %), ";
	}

if (document.f.cal.value==0){
	twitter_cal = "Good job! ";
	}else{
	twitter_cal = " "+document.f.cal.value+" cal.It\'s "+document.f.cburger.value+" P of Cheeseburger. Or "+document.f.beer2.value+" of 12 floz Beer.";
	}

twitter_credit=" #treadsim http://42.195km.net/e";

twitter_com="Treadmil! "+document.f.ddm.value+"mi("+document.f.dd.value+"km),"+document.f.zz.value+" min, "+twitter_angle+twitter_cal+twitter_credit;


}
