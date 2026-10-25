package com.mint.rebuilt;
import android.content.*;
import android.database.*;
import android.database.sqlite.*;
import android.webkit.JavascriptInterface;
public final class WagerStore {
 private final Database db;private static final Object LOCK=new Object();
 public WagerStore(Context c){db=new Database(c.getApplicationContext());}
 @JavascriptInterface public String total(){synchronized(LOCK){try{return result(db.getReadableDatabase());}catch(Exception e){return "{\"error\":true}";}}}
 @JavascriptInterface public String record(String game,String round,long milli){if(!"jdb-mines-9014".equals(game)||round==null||!round.matches("[0-9]{1,24}")||milli<0||milli>1000000000000L)return "{\"error\":true}";synchronized(LOCK){try{SQLiteDatabase d=db.getWritableDatabase();ContentValues v=new ContentValues();v.put("id",game+"|"+round);v.put("milli",milli);d.insertWithOnConflict("rounds",null,v,SQLiteDatabase.CONFLICT_IGNORE);return result(d);}catch(Exception e){return "{\"error\":true}";}}}
 private String result(SQLiteDatabase d){Cursor c=d.rawQuery("SELECT COALESCE(SUM(milli),0) FROM rounds",null);try{c.moveToFirst();long n=c.getLong(0);return n>=0&&n<=9007199254740991L?"{\"milli\":"+n+"}":"{\"error\":true}";}finally{c.close();}}
 private static final class Database extends SQLiteOpenHelper{Database(Context c){super(c,"mint_wager_v1.db",null,1);}public void onCreate(SQLiteDatabase d){d.execSQL("CREATE TABLE rounds(id TEXT PRIMARY KEY,milli INTEGER NOT NULL)");}public void onUpgrade(SQLiteDatabase d,int o,int n){}}
}
