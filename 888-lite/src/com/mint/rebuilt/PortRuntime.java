package com.mint.rebuilt;
import android.app.*;
import android.content.*;
import android.net.Uri;
import android.os.*;
import android.webkit.*;
import java.io.*;
import java.lang.ref.WeakReference;
import java.lang.reflect.*;
import java.util.*;
import org.json.*;
public final class PortRuntime {
 private static final WeakHashMap<WebView,WeakReference<Activity>> views=new WeakHashMap<WebView,WeakReference<Activity>>();
 private static final Set<WebView> gameAttached=Collections.newSetFromMap(new WeakHashMap<WebView,Boolean>());
 private static String extra;
 private static final WeakHashMap<WebView,Set<String>> registeredOrigins=new WeakHashMap<WebView,Set<String>>();
 static boolean opened;static String code="";static boolean routeUsed;
 public static boolean ensureGate(Activity a){if(opened)return false;Intent i=new Intent(a,GateActivity.class);i.putExtra("originalIntent",a.getIntent());a.startActivity(i);a.finish();return true;}
 public static synchronized String scripts(Context c,String original){PortScope.init(c);try{if(extra==null){StringBuilder b=new StringBuilder();for(String name:new String[]{"mint-port-bootstrap.js","mint-component-policy.js","mint-automatic-requests.js","mint-rebuilt.js"}){b.append('\n').append(read(c,name));}extra=b.toString();}return original+extra;}catch(Exception e){return original;}}
 public static String read(Context c,String name)throws IOException{InputStream in=c.getAssets().open(name);try{ByteArrayOutputStream b=new ByteArrayOutputStream();byte[] x=new byte[4096];int n;while((n=in.read(x))!=-1){if(b.size()+n>300000)throw new IOException("Asset exceeds limit");b.write(x,0,n);}return b.toString("UTF-8");}finally{in.close();}}
 public static void attach(Activity a,WebView v){PortScope.init(a);synchronized(views){if(views.containsKey(v))return;views.put(v,new WeakReference<Activity>(a));}synchronized(registeredOrigins){registeredOrigins.put(v,PortScope.all());}v.addJavascriptInterface(new Bridge(a,v),"MintPort");v.addJavascriptInterface(new AdResources(),"MintAdResources");v.addJavascriptInterface(new WagerStore(a),"MintWagerCounter");AutomaticRequestPolicy.attach(v);BrowserProxy.restore(a);ProxyService.ensure(a);registerGame(v);}
 private static void registerGame(WebView view){try{synchronized(gameAttached){if(gameAttached.contains(view))return;}Class<?> ft=Class.forName("org.chromium.support_lib_boundary.WebViewProviderFactoryBoundaryInterface");InvocationHandler h=(InvocationHandler)Class.forName("b5.a").getMethod("h").invoke(null);Object factory=Proxy.newProxyInstance(ft.getClassLoader(),new Class[]{ft},h);InvocationHandler wh=(InvocationHandler)ft.getMethod("createWebView",WebView.class).invoke(factory,view);Class<?> wt=Class.forName("org.chromium.support_lib_boundary.WebViewProviderBoundaryInterface");Object provider=Proxy.newProxyInstance(wt.getClassLoader(),new Class[]{wt},wh);wt.getMethod("addDocumentStartJavaScript",String.class,String[].class).invoke(provider,"(function(){if(!/^\\/h5\\/games\\/9\\/9014\\//.test(location.pathname))return;"+scripts(view.getContext(),"")+"\n})();",new String[]{"*"});synchronized(gameAttached){gameAttached.add(view);}}catch(Exception ignored){}}
 public static void prepared(WebView view,String url){
  if(view==null)return;
  AdResources.pageStarted(view,url);
  if(!PortScope.trusted(url))return;
  String origin=PortScope.origin(url);
  synchronized(registeredOrigins){Set<String> found=registeredOrigins.get(view);if(found!=null&&found.contains(origin))return;}
  try{
   Class<?> ft=Class.forName("org.chromium.support_lib_boundary.WebViewProviderFactoryBoundaryInterface");
   InvocationHandler h=(InvocationHandler)Class.forName("b5.a").getMethod("h").invoke(null);
   Object factory=Proxy.newProxyInstance(ft.getClassLoader(),new Class[]{ft},h);
   InvocationHandler wh=(InvocationHandler)ft.getMethod("createWebView",WebView.class).invoke(factory,view);
   Class<?> wt=Class.forName("org.chromium.support_lib_boundary.WebViewProviderBoundaryInterface");
   Object provider=Proxy.newProxyInstance(wt.getClassLoader(),new Class[]{wt},wh);
   wt.getMethod("addDocumentStartJavaScript",String.class,String[].class).invoke(provider,scripts(view.getContext(),""),new String[]{origin});
   synchronized(registeredOrigins){Set<String> found=registeredOrigins.get(view);if(found==null){found=new HashSet<String>();registeredOrigins.put(view,found);}found.add(origin);}
  }catch(Exception unavailable){/* Existing head-script and page callbacks remain the fallback. */}
 }
 public static boolean handleNavigation(WebView view,String url){
  Uri u;try{u=Uri.parse(url);}catch(Exception e){return false;}
  if(!"mint-port".equals(u.getScheme())||!"settings".equals(u.getHost()))return false;
  if(view!=null&&PortScope.trusted(view.getUrl())){
   Activity a=BrowserProxy.activity(view.getContext());
   if(a!=null&&!a.isFinishing())try{a.startActivity(new Intent(a,SettingsActivity.class));}catch(Exception e){android.widget.Toast.makeText(a,"Não foi possível abrir Configurações.",android.widget.Toast.LENGTH_LONG).show();}
  }
  return true;
 }
 public static void injectGame(WebView v){try{if(PortScope.game(v.getUrl()))v.evaluateJavascript(scripts(v.getContext(),""),null);}catch(Exception ignored){}}
 public static String route(WebView v,String url){try{if(!routeUsed&&!code.isEmpty()&&PortScope.trusted(url)){Uri u=Uri.parse(url);String p=u.getPath();if(p==null||p.isEmpty()||p.equals("/")||p.matches("/home(?:/(?:login|register))?/?")){Uri.Builder b=u.buildUpon().path("/home/register");b.clearQuery();for(String key:u.getQueryParameterNames())if(!key.equals("id"))for(String val:u.getQueryParameters(key))b.appendQueryParameter(key,val);b.appendQueryParameter("id",code);routeUsed=true;url=b.build().toString();}}}catch(Exception ignored){}AdResources.pageStarted(v,url);return url;}
 public static void changed(){final ArrayList<WebView> copy;synchronized(views){copy=new ArrayList<WebView>(views.keySet());}for(final WebView v:copy)if(v!=null)v.post(new Runnable(){public void run(){try{v.evaluateJavascript(bootstrap(v.getContext()),null);}catch(Exception ignored){}}});}
 private static String bootstrap(Context c)throws IOException{return read(c,"mint-port-bootstrap.js");}
 public static final class Bridge {
  private final WeakReference<Activity> activity;private final WeakReference<WebView> view;
  Bridge(Activity a,WebView v){activity=new WeakReference<Activity>(a);view=new WeakReference<WebView>(v);}
  @JavascriptInterface public String scope(){return new JSONArray(PortScope.all()).toString();}
  @JavascriptInterface public boolean trusted(String url){return PortScope.trusted(url);}
  @JavascriptInterface public boolean originAllowed(String url){return PortScope.trusted(url)||PortScope.game(url);}
  @JavascriptInterface public boolean apiHost(String host){return PortScope.apiHost(host);}
  @JavascriptInterface public String config(String origin){Activity a=activity.get();if(a==null||!(PortScope.trusted(origin)||PortScope.game(origin)))return "{}";return ConfigNative.page(a,PortScope.game(origin));}
  @JavascriptInterface public boolean openSettings(final String origin) {
   final Activity a=activity.get();
   if(a==null||!PortScope.trusted(origin))return false;
   a.runOnUiThread(new Runnable(){
    public void run(){
     WebView v=view.get();
     if(v==null||!PortScope.trusted(v.getUrl()))return;
     try{a.startActivity(new Intent(a,SettingsActivity.class));}
     catch(Exception e){android.widget.Toast.makeText(a,"Não foi possível abrir Configurações.",android.widget.Toast.LENGTH_LONG).show();}
    }
   });
   return true;
  }
 }
}
