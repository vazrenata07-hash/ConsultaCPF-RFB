package com.mint.rebuilt;
import android.content.Context;
import java.io.*;
import org.json.JSONObject;
/** Launch choice survives ordinary restarts; the existing internal cleanup erases no_backup. */
public final class LaunchState {
 private static File file(Context c){return new File(c.getNoBackupFilesDir(),"mint_launch_choice_v1.json");}
 public static synchronized boolean restore(Context c){
  try{
   File f=file(c);if(!f.isFile())return false;
   FileInputStream in=new FileInputStream(f);ByteArrayOutputStream b=new ByteArrayOutputStream();
   try{byte[] bytes=new byte[512];int n;while((n=in.read(bytes))!=-1){if(b.size()+n>4096)return false;b.write(bytes,0,n);}}finally{in.close();}
   JSONObject value=new JSONObject(b.toString("UTF-8"));String code=value.optString("code","");
   if(!value.optBoolean("confirmed",false)||!code.isEmpty()&&!code.matches("[0-9]{7,}"))return false;
   PortRuntime.code=code;PortRuntime.routeUsed=true;PortRuntime.opened=true;return true;
  }catch(Exception e){return false;}
 }
 public static synchronized boolean save(Context c,String code){
  File temp=null;try{
   JSONObject value=new JSONObject().put("confirmed",true).put("code",code);
   File f=file(c);temp=new File(f.getParentFile(),"mint_launch_choice_v1.tmp");
   FileOutputStream out=new FileOutputStream(temp);try{out.write(value.toString().getBytes("UTF-8"));out.getFD().sync();}finally{out.close();}
   if(!temp.renameTo(f))throw new IOException();return true;
  }catch(Exception e){if(temp!=null)temp.delete();return false;}
 }
}
