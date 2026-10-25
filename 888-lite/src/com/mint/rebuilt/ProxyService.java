package com.mint.rebuilt;
import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.*;
import android.widget.Toast;
import org.json.JSONObject;
public final class ProxyService extends Service {
 private static final String CHANNEL="mint_888_proxy_v7";private static final int ID=8882707;private static ProxyService instance;
 public static void ensure(Context c){if(Build.VERSION.SDK_INT>=33&&c.checkSelfPermission("android.permission.POST_NOTIFICATIONS")!=PackageManager.PERMISSION_GRANTED)return;try{Intent i=new Intent(c,ProxyService.class);if(Build.VERSION.SDK_INT>=26)c.startForegroundService(i);else c.startService(i);}catch(Exception e){Toast.makeText(c,"Abra o app para mostrar o controle do proxy.",Toast.LENGTH_SHORT).show();}}
 public static void refresh(boolean ignored){final ProxyService s=instance;if(s!=null)new Handler(Looper.getMainLooper()).post(new Runnable(){public void run(){try{((NotificationManager)s.getSystemService(NOTIFICATION_SERVICE)).notify(ID,s.notification());}catch(Exception ignored){}}});}
 private Notification notification(){NotificationManager n=(NotificationManager)getSystemService(NOTIFICATION_SERVICE);if(Build.VERSION.SDK_INT>=26){NotificationChannel c=new NotificationChannel(CHANNEL,"Controle do proxy",NotificationManager.IMPORTANCE_LOW);c.setShowBadge(false);n.createNotificationChannel(c);}boolean enabled=BrowserProxy.isEnabled(this),pending=BrowserProxy.isPending();String status=pending?"Alterando…":enabled?"ON":"OFF";Intent toggle=new Intent(this,ToggleProxyReceiver.class).setAction(getPackageName()+".TOGGLE_PROXY");PendingIntent action=PendingIntent.getBroadcast(this,ID,toggle,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);PendingIntent settings=PendingIntent.getActivity(this,ID,new Intent(this,SettingsActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);Notification.Builder b=Build.VERSION.SDK_INT>=26?new Notification.Builder(this,CHANNEL):new Notification.Builder(this);b.setSmallIcon(android.R.drawable.ic_lock_lock).setContentTitle("Proxy · "+status).setContentText("Toque para configurar · use o botão para ligar ou desligar").setContentIntent(settings).setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false).setVisibility(Notification.VISIBILITY_PRIVATE).addAction(android.R.drawable.ic_media_play,pending?"Aguarde":enabled?"Desativar · ON":"Ativar · OFF",action);return b.build();}
 @Override public void onCreate(){super.onCreate();instance=this;if(Build.VERSION.SDK_INT>=34)startForeground(ID,notification(),0x40000000);else startForeground(ID,notification());BrowserProxy.restore(this);}
 @Override public int onStartCommand(Intent i,int f,int id){refresh(false);return START_STICKY;}
 @Override public IBinder onBind(Intent i){return null;}
 @Override public void onDestroy(){if(instance==this)instance=null;super.onDestroy();}
 public static final class ToggleProxyReceiver extends BroadcastReceiver {
  @Override public void onReceive(Context c,Intent i){if(i==null||!(c.getPackageName()+".TOGGLE_PROXY").equals(i.getAction())||BrowserProxy.isPending())return;try{JSONObject current=new JSONObject(ConfigNative.json(c));boolean next=!BrowserProxy.isEnabled(c);if(next)new ProxyConfig(true,current.optString("proxyProtocol","http"),current.optString("proxyHost",""),current.optInt("proxyPort",0),current.optString("proxyUsername",""),current.optString("proxyPassword",""));current.put("proxyEnabled",next);JSONObject old=new JSONObject(ConfigNative.json(c));if(!ConfigNative.write(c,current))throw new IllegalStateException();if(!BrowserProxy.apply(c,next)){ConfigNative.write(c,old);return;}ensure(c);refresh(next);}catch(Exception error){Toast.makeText(c,"Defina host e porta válidos nas configurações de proxy.",Toast.LENGTH_LONG).show();refresh(false);}}
 }
}
