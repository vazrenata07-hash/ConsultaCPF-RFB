package com.mint.rebuilt;
import android.webkit.WebView;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
/** A small request guard loaded once; no event capture or diagnostic interface. */
public final class AutomaticScripts {
 private static volatile String prefix;
 private static String read(WebView view,String name)throws Exception{
  InputStream in=view.getContext().getAssets().open(name);
  try{ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=in.read(b))!=-1){if(out.size()+n>131072)throw new IllegalArgumentException("Policy asset too large");out.write(b,0,n);}return out.toString("UTF-8");}finally{in.close();}
 }
 private AutomaticScripts(){}
 public static void attach(WebView view){
  if(view==null)return;
  AutomaticRequestPolicy.attach(view);
  if(prefix!=null)return;
  synchronized(AutomaticScripts.class){
   if(prefix!=null)return;
   try{
    InputStream in=view.getContext().getAssets().open("mint-automatic-requests.js");
    try{
     ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buffer=new byte[4096];int n;
     while((n=in.read(buffer))!=-1){if(out.size()+n>65536)throw new IllegalArgumentException("Request policy too large");out.write(buffer,0,n);}
     prefix="(function(){try{"+(char)10+read(view,"mint-component-policy.js")+(char)10+"}catch(_mintComponentInit){}})();"+(char)10+"(function(){try{"+(char)10+out.toString("UTF-8")+(char)10+"}catch(_mintAutomaticRequestInit){}})();"+(char)10;
    }finally{in.close();}
   }catch(Exception unavailable){prefix="";}
  }
 }
 public static String prepend(String base){return(prefix==null?"":prefix)+(base==null?"":base);}
}
