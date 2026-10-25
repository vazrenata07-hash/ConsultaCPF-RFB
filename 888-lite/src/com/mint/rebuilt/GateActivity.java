package com.mint.rebuilt;
import android.app.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.os.*;
import android.net.Uri;
import android.webkit.*;
import android.view.*;
public final class GateActivity extends Activity {
 private Dialog dialog;private WebView view;
 @Override public void onCreate(Bundle b){super.onCreate(b);PortScope.init(this);show();}
 private void show(){dialog=new Dialog(this);dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);dialog.setCancelable(false);view=new WebView(this);view.setBackgroundColor(Color.TRANSPARENT);view.getSettings().setJavaScriptEnabled(true);view.getSettings().setAllowFileAccess(false);view.getSettings().setAllowContentAccess(false);view.setWebViewClient(new WebViewClient(){@Override public boolean shouldOverrideUrlLoading(WebView v,String url){return confirm(url);}@Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return confirm(r.getUrl().toString());}});dialog.setContentView(view);dialog.getWindow().setBackgroundDrawable(new ColorDrawable(Color.TRANSPARENT));dialog.show();int width=Math.min(getResources().getDisplayMetrics().widthPixels-dp(24),dp(400));dialog.getWindow().setLayout(width,dp(390));view.loadUrl("file:///android_asset/mint-matrix.html");}
 private int dp(int n){return (int)(n*getResources().getDisplayMetrics().density+.5f);}
 private boolean confirm(String url){Uri u=Uri.parse(url);if(!"mint-open".equals(u.getScheme()))return !url.startsWith("file:///android_asset/mint-matrix.html");String code=u.getQueryParameter("code");if(code==null)code="";if(!code.isEmpty()&&!code.matches("[0-9]{7,}")){view.evaluateJavascript("showError('Deixe vazio ou use pelo menos 7 dígitos.')",null);return true;}PortRuntime.code=code;PortRuntime.routeUsed=false;PortRuntime.opened=true;dialog.dismiss();if(Build.VERSION.SDK_INT>=33&&checkSelfPermission("android.permission.POST_NOTIFICATIONS")!=android.content.pm.PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"},7207);}else launch();return true;}
 @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] results){super.onRequestPermissionsResult(request,permissions,results);if(request==7207)launch();}
 private void launch(){ProxyService.ensure(this);Intent previous=getIntent().getParcelableExtra("originalIntent");Intent i=previous==null?new Intent():new Intent(previous);i.setClassName(this,"com.speed.client.CCMainActivity");i.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_NEW_TASK);startActivity(i);finish();}
 @Override protected void onDestroy(){if(dialog!=null)dialog.dismiss();if(view!=null){view.stopLoading();view.destroy();}super.onDestroy();}
}
