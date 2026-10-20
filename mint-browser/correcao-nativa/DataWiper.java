package com.mint.rebuilt;
import java.io.File;

/** Clears browser data, preserving only the custom mod preference file. */
public final class DataWiper {
 public static int clear(File directory,boolean keepNativeLibrary){
  try{
   File root=directory.getCanonicalFile();
   if(!root.exists())return 0;
   File[] children=root.listFiles();if(children==null)return 1;
   int failures=0;
   for(File child:children)if(!keepNativeLibrary||!child.getName().equals("lib"))failures+=erase(child,root,keepNativeLibrary);
   return failures;
  }catch(Exception e){return 1;}
 }
 private static boolean protectedSetting(File file,File root,boolean preserve){
  if(!preserve)return false;
  String name=file.getName();
  return (name.equals("mint_custom_config.xml")||name.equals("mint_custom_config.xml.bak"))
    &&file.getParentFile().equals(new File(root,"shared_prefs"));
 }
 private static boolean containsProtectedSettings(File file,File root,boolean preserve){
  return preserve&&file.equals(new File(root,"shared_prefs"))
    &&(new File(file,"mint_custom_config.xml").exists()||new File(file,"mint_custom_config.xml.bak").exists());
 }
 private static int erase(File file,File root,boolean preserve){
  try{
   String real=file.getCanonicalPath(),absolute=file.getAbsolutePath();
   // Never follow a symbolic link, including one named like a protected setting.
   if(!real.equals(absolute))return file.delete()?0:1;
   if(!real.startsWith(root.getPath()+File.separator))return 1;
   if(protectedSetting(file,root,preserve))return 0;
   int failures=0;
   if(file.isDirectory()){
    File[] children=file.listFiles();if(children==null)return 1;
    for(File child:children)failures+=erase(child,root,preserve);
    // Leaving this one preference directory is intentional, not a cleanup failure.
    if(containsProtectedSettings(file,root,preserve))return failures;
   }
   if(!file.delete())failures++;
   return failures;
  }catch(Exception e){return 1;}
 }
}
