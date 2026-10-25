package com.mint.rebuilt;
import android.content.Context;
import android.net.Uri;
import java.io.*;
import java.util.*;
public final class PortScope {
 private static final Set<String> origins=new HashSet<String>();
 public static synchronized void init(Context c){if(!origins.isEmpty())return;try{BufferedReader r=new BufferedReader(new InputStreamReader(c.getAssets().open("lite_origins.txt"),"UTF-8"));try{String line;while((line=r.readLine())!=null)if(!line.trim().isEmpty())origins.add(line.trim().toLowerCase(Locale.US));}finally{r.close();}}catch(Exception ignored){}}
 public static String origin(String value){try{Uri u=Uri.parse(value);String s=u.getScheme(),h=u.getHost();if(h==null||!("https".equalsIgnoreCase(s)||"http".equalsIgnoreCase(s)))return "";return s.toLowerCase(Locale.US)+"://"+h.toLowerCase(Locale.US)+(u.getPort()==-1?"":":"+u.getPort());}catch(Exception e){return "";}}
 public static boolean trusted(String value){return origins.contains(origin(value));}
 public static boolean game(String value){try{Uri u=Uri.parse(value);String h=u.getHost();return h!=null&&(h.equalsIgnoreCase("brteachcor.com")||h.toLowerCase(Locale.US).endsWith(".brteachcor.com"))&&("https".equalsIgnoreCase(u.getScheme())||"http".equalsIgnoreCase(u.getScheme()));}catch(Exception e){return false;}}
 public static Set<String> all(){return new HashSet<String>(origins);}
 public static boolean apiHost(String host){if(host==null)return false;host=host.toLowerCase(Locale.US);return host.equals("cdnapiif.ppa888pg.vip")||(host.startsWith("cdnapiif.")&&trusted("https://"+host));}
 public static boolean artworkHost(String host){if(host==null)return false;host=host.toLowerCase(Locale.US);return host.equals("cdntoos.cf888pg.com")||(host.startsWith("cdntoos.")&&trusted("https://"+host));}
}
