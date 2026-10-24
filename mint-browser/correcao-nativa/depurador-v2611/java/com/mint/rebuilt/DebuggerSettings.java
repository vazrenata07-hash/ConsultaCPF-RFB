package com.mint.rebuilt;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.Button;
import android.widget.Spinner;
import android.widget.ArrayAdapter;
import android.widget.AdapterView;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/** Native, manually refreshed request debugger. No Activity or manifest changes. */
public final class DebuggerSettings {
    private static final String KEY="mint_debugger";
    private static final int MAX_EVENTS=80;
    private DebuggerSettings(){}

    /** Called after the original root settings have been assembled. */
    public static void add(final Object fragment) {
        try {
            final Activity a=(Activity)fragment.getClass().getMethod("getActivity").invoke(fragment);
            if(a==null||a.isFinishing())return;
            Object screen;
            boolean framework;
            try{screen=fragment.getClass().getMethod("getPreferenceScreen").invoke(fragment);framework=true;}
            catch(NoSuchMethodException oldNames){screen=fragment.getClass().getMethod("k").invoke(fragment);framework=false;}
            if(screen==null)return;
            String base=framework?"android.preference.":"androidx.preference.";
            Class<?> preference=Class.forName(base+"Preference");
            Object existing=screen.getClass().getMethod(framework?"findPreference":"I0",CharSequence.class).invoke(screen,KEY);
            if(existing!=null){if(!framework)preference.getMethod("A0",boolean.class).invoke(existing,true);return;}
            Object item=preference.getConstructor(Context.class).newInstance(a);
            if(framework)preference.getMethod("setKey",String.class).invoke(item,KEY);
            else{Field key=preference.getDeclaredField("q");key.setAccessible(true);key.set(item,KEY);}
            preference.getMethod(framework?"setTitle":"z0",CharSequence.class).invoke(item,"Depurador de requisições");
            preference.getMethod(framework?"setSummary":"x0",CharSequence.class).invoke(item,"Captura manual e bloqueios de consultas ou temporizadores.");
            preference.getMethod(framework?"setOrder":"u0",int.class).invoke(item,20);
            preference.getMethod(framework?"setPersistent":"v0",boolean.class).invoke(item,false);
            Class<?> listener=Class.forName(framework?"android.preference.Preference$OnPreferenceClickListener":"androidx.preference.Preference$e");
            Object callback=Proxy.newProxyInstance(listener.getClassLoader(),new Class<?>[]{listener},new InvocationHandler(){
                public Object invoke(Object proxy,Method method,Object[] args){
                    String name=method.getName();
                    if(name.equals("c")||name.equals("onPreferenceClick")){open(a);return Boolean.TRUE;}
                    if(name.equals("hashCode"))return Integer.valueOf(System.identityHashCode(proxy));
                    if(name.equals("equals"))return Boolean.valueOf(args!=null&&args.length==1&&proxy==args[0]);
                    if(name.equals("toString"))return "MintDebuggerPreference";
                    return null;
                }
            });
            preference.getMethod(framework?"setOnPreferenceClickListener":"t0",listener).invoke(item,callback);
            screen.getClass().getMethod(framework?"addPreference":"H0",preference).invoke(screen,item);
        }catch(Exception unavailable){/* Preserve the existing settings if the entry cannot be appended. */}
    }
    public static void open(Activity a){if(a!=null&&!a.isFinishing())new Panel(a).show();}

    private static Object core(String name,Class<?>[] signature,Object... values)throws Exception{
        Object value=Class.forName("com.mint.rebuilt.RequestDebugger").getMethod(name,signature).invoke(null,values);
        if(Boolean.FALSE.equals(value))throw new IllegalStateException("Debugger action rejected");
        return value;
    }
    private static JSONObject snapshot(Context a)throws Exception{return new JSONObject((String)core("snapshot",new Class<?>[]{Context.class},a));}
    private static void configure(Context a,boolean enabled)throws Exception{core("configure",new Class<?>[]{Context.class,boolean.class},a,enabled);}
    private static void setRule(Context a,JSONObject rule)throws Exception{core("setRule",new Class<?>[]{Context.class,JSONObject.class},a,rule);}
    private static void error(Activity a){Toast.makeText(a,"Não foi possível concluir a ação do depurador.",Toast.LENGTH_SHORT).show();}
    private static String shortText(String value,int limit){if(value==null)return "";return value.length()>limit?value.substring(0,limit)+"…":value;}
    private static String route(JSONObject event){
        String host=event.optString("host",""),path=event.optString("path","");
        if(host.length()==0||path.length()==0)try{Uri uri=Uri.parse(event.optString("url",event.optString("page","")));if(host.length()==0&&uri.getHost()!=null)host=uri.getHost();if(path.length()==0&&uri.getEncodedPath()!=null)path=uri.getEncodedPath();}catch(Exception ignored){}
        return host+path;
    }
    private static String eventLabel(JSONObject event){
        String kind=event.optString("kind","request"),api=event.optString("api",kind),blocked=event.optBoolean("blocked",false)?" · bloqueado pela regra":" · registrado/tentativa";
        if(kind.equals("timer"))return api+" · "+event.optLong("delay",0)+" ms"+(event.optBoolean("repeat",false)?" · repetido":"")+blocked+"\n"+shortText(event.optString("signature",""),110);
        if(kind.equals("popup"))return "Janela observada\n"+shortText(event.optString("selector",event.optString("signature","sem seletor")),170);
        return api+" · "+event.optString("method","GET")+blocked+"\n"+shortText(route(event),220);
    }

    private static final class Panel {
        final Activity a;LinearLayout events;TextView summary;CheckBox capture;Spinner filter;boolean updating;
        Panel(Activity a){this.a=a;}
        void show(){
            LinearLayout column=column(a);ScrollView scroll=scroll(a,column);
            note(a,column,"A captura começa desligada. Não registra payloads, cookies ou senhas. Proximidade temporal não prova que uma consulta abriu uma janela.");
            capture=new CheckBox(a);capture.setText("Capturar eventos");capture.setMinHeight(dp(a,48));column.addView(capture);
            capture.setOnCheckedChangeListener(new CompoundButton.OnCheckedChangeListener(){public void onCheckedChanged(CompoundButton view,boolean enabled){if(updating)return;try{configure(a,enabled);refresh();}catch(Exception failure){error(a);refresh();}}});
            filter=new Spinner(a);ArrayAdapter<String> choices=new ArrayAdapter<String>(a,android.R.layout.simple_spinner_item,new String[]{"Todos","Requisições","Temporizadores","Janelas"});choices.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);filter.setAdapter(choices);filter.setContentDescription("Tipo de evento exibido");column.addView(filter,new LinearLayout.LayoutParams(-1,dp(a,48)));
            filter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener(){public void onItemSelected(AdapterView<?> parent,View view,int position,long id){if(events!=null)refresh();}public void onNothingSelected(AdapterView<?> parent){}});
            button(a,column,"Recarregar e capturar",new View.OnClickListener(){public void onClick(View view){try{configure(a,true);updating=true;capture.setChecked(true);updating=false;core("reloadPages",new Class<?>[0]);refresh();}catch(Exception failure){updating=false;error(a);}}});
            LinearLayout actions=row(a,column);
            smallButton(a,actions,"Atualizar",new View.OnClickListener(){public void onClick(View view){refresh();}});
            smallButton(a,actions,"Limpar registro",new View.OnClickListener(){public void onClick(View view){try{core("clear",new Class<?>[]{Context.class},a);refresh();}catch(Exception failure){error(a);}}});
            LinearLayout secondary=row(a,column);
            smallButton(a,secondary,"Bloqueios",new View.OnClickListener(){public void onClick(View view){new Rules(a).show();}});
            smallButton(a,secondary,"Exportar",new View.OnClickListener(){public void onClick(View view){export(a);}});
            note(a,column,"Toque em Atualizar para ver novos eventos. Toque num evento para detalhes e opções de bloqueio. Limpar registro não remove os bloqueios.");
            summary=text(a,"",13);column.addView(summary);events=new LinearLayout(a);events.setOrientation(LinearLayout.VERTICAL);column.addView(events);
            AlertDialog dialog=new AlertDialog.Builder(a).setTitle("Depurador de requisições").setView(scroll).setPositiveButton("Fechar",null).create();dialog.show();size(a,dialog);refresh();
        }
        void refresh(){
            try{
                JSONObject data=snapshot(a);updating=true;capture.setChecked(data.optBoolean("capture",false));updating=false;
                JSONArray list=data.optJSONArray("events");int total=list==null?0:list.length(),matched=0,shown=0;
                String[] kinds={"","request","timer","popup"};int position=filter==null?0:filter.getSelectedItemPosition();if(position<0||position>=kinds.length)position=0;String selected=kinds[position];
                events.removeAllViews();
                for(int i=total-1;i>=0;i--){
                    final JSONObject event=list.optJSONObject(i);if(event==null||selected.length()>0&&!selected.equals(event.optString("kind","request")))continue;
                    matched++;if(shown>=MAX_EVENTS)continue;shown++;
                    TextView item=text(a,eventLabel(event),14);item.setMinHeight(dp(a,56));item.setPadding(dp(a,10),dp(a,12),dp(a,10),dp(a,12));item.setBackgroundColor(0xfff1f5f4);LinearLayout.LayoutParams lp=new LinearLayout.LayoutParams(-1,-2);lp.topMargin=dp(a,5);events.addView(item,lp);item.setOnClickListener(new View.OnClickListener(){public void onClick(View view){details(a,event);}});
                }
                summary.setText(total+" eventos no registro · "+matched+" neste filtro · "+shown+" exibidos");
                if(matched==0)note(a,events,"Nenhum evento neste filtro.");
            }catch(Exception failure){updating=false;summary.setText("Não foi possível carregar os eventos.");}
        }
    }
    private static void details(final Activity a,final JSONObject event){
        String kind=event.optString("kind","request");
        StringBuilder value=new StringBuilder(eventLabel(event));
        value.append("\n\nPágina: ").append(shortText(event.optString("page",""),1000));
        value.append("\nInstante: ").append(event.optString("time",""));
        if(kind.equals("popup")){value.append("\n\nRecursos: ").append(shortText(String.valueOf(event.has("assets")?event.opt("assets"):event.opt("images")),3000));value.append("\nConsultas próximas: ").append(shortText(String.valueOf(event.opt("nearbyRequests")),3000));value.append("\n\nCorrelação temporal não estabelece a causa da janela.");}
        value.append("\n\nPilha de chamadas:\n").append(shortText(event.optString("stack","Não disponível neste evento."),12000));
        LinearLayout column=column(a);TextView contents=text(a,value.toString(),13);contents.setTextIsSelectable(true);column.addView(contents);
        AlertDialog.Builder builder=new AlertDialog.Builder(a).setTitle("Detalhes do evento").setView(scroll(a,column)).setNegativeButton("Fechar",null);
        if(kind.equals("request")||kind.equals("timer"))builder.setPositiveButton("Bloquear",new DialogInterface.OnClickListener(){public void onClick(DialogInterface dialog,int which){blockEvent(a,event);}});
        AlertDialog dialog=builder.create();dialog.show();size(a,dialog);
    }
    private static void blockEvent(final Activity a,final JSONObject event){
        try{
            final JSONObject rule=new JSONObject();String kind=event.optString("kind","request");rule.put("enabled",true);rule.put("kind",kind);
            String warning;
            if(kind.equals("timer")){
                Object signature=event.opt("signature");if(signature==null||String.valueOf(signature).length()==0||String.valueOf(signature).startsWith("string-")){Toast.makeText(a,"Este temporizador não possui assinatura de bloqueio.",Toast.LENGTH_SHORT).show();return;}
                rule.put("signature",signature);String host=event.optString("host",""),path=event.optString("path","");
                if(host.length()==0)try{Uri page=Uri.parse(event.optString("page",""));host=page.getHost()==null?"":page.getHost();path=page.getEncodedPath()==null?"":page.getEncodedPath();}catch(Exception ignored){}
                if(host.length()>0)rule.put("host",host.toLowerCase(Locale.US));if(path.length()>0)rule.put("path",path);
                warning="Bloqueia os temporizadores com esta assinatura. Outras funções que usem o mesmo temporizador também podem ser afetadas.";
            }else{
                String host=event.optString("host",""),path=event.optString("path","");
                if(host.length()==0||path.length()==0){Uri url=Uri.parse(event.optString("url",""));host=url.getHost();path=url.getEncodedPath();}
                if(host==null||host.length()==0||path==null||!path.startsWith("/"))throw new IllegalArgumentException();
                rule.put("host",host.toLowerCase(Locale.US));rule.put("path",path);rule.put("method",event.optString("method","GET").toUpperCase(Locale.US));
                warning="Bloqueia todas as consultas a este caminho; pode afetar funções que usam o mesmo endpoint. Parâmetros da URL não diferenciam as consultas.";
            }
            new AlertDialog.Builder(a).setTitle("Adicionar bloqueio?").setMessage(warning).setNegativeButton("Cancelar",null).setPositiveButton("Bloquear",new DialogInterface.OnClickListener(){public void onClick(DialogInterface dialog,int which){try{setRule(a,rule);Toast.makeText(a,"Bloqueio adicionado. Recarregue a página para aplicar aos eventos seguintes.",Toast.LENGTH_LONG).show();}catch(Exception failure){error(a);}}}).show();
        }catch(Exception invalid){Toast.makeText(a,"Este evento não contém dados suficientes para um bloqueio seguro.",Toast.LENGTH_SHORT).show();}
    }
    private static final class Rules {
        final Activity a;LinearLayout list;
        Rules(Activity a){this.a=a;}
        void show(){LinearLayout column=column(a);note(a,column,"Toque num bloqueio para removê-lo. Remover permite novamente as próximas consultas ou temporizadores correspondentes.");button(a,column,"Adicionar por caminho",new View.OnClickListener(){public void onClick(View view){manual(a,new Runnable(){public void run(){refresh();}});}});list=new LinearLayout(a);list.setOrientation(LinearLayout.VERTICAL);column.addView(list);AlertDialog dialog=new AlertDialog.Builder(a).setTitle("Bloqueios").setView(scroll(a,column)).setPositiveButton("Fechar",null).create();dialog.show();size(a,dialog);refresh();}
        void refresh(){try{JSONArray rules=snapshot(a).optJSONArray("rules");list.removeAllViews();if(rules==null||rules.length()==0){note(a,list,"Nenhum bloqueio personalizado.");return;}int count=Math.min(rules.length(),80);for(int i=0;i<count;i++){final JSONObject rule=rules.optJSONObject(i);if(rule==null)continue;String name=rule.optString("kind","request").equals("timer")?"Temporizador · "+shortText(rule.optString("signature",""),120):rule.optString("method","*")+" "+rule.optString("host","")+rule.optString("path","");if(!rule.optBoolean("enabled",true))name="Desativado · "+name;final String label=name;button(a,list,shortText(name,230),new View.OnClickListener(){public void onClick(View view){new AlertDialog.Builder(a).setTitle("Remover bloqueio?").setMessage(label).setNegativeButton("Cancelar",null).setPositiveButton("Remover",new DialogInterface.OnClickListener(){public void onClick(DialogInterface dialog,int which){try{String id=rule.optString("id","");if(id.length()==0)throw new IllegalArgumentException();core("removeRule",new Class<?>[]{Context.class,String.class},a,id);refresh();}catch(Exception failure){error(a);}}}).show();}});}if(rules.length()>count)note(a,list,"Exibindo os primeiros 80 bloqueios.");}catch(Exception failure){error(a);}}
    }
    private static void manual(final Activity a,final Runnable changed){
        LinearLayout column=column(a);note(a,column,"Regra exata de host e caminho, sem parâmetros de URL. Pode afetar funções que usam o mesmo endpoint.");
        final EditText host=field(a,column,"Host","");final EditText path=field(a,column,"Caminho","/");final EditText method=field(a,column,"Método (* ou GET, POST…)","*");
        final AlertDialog dialog=new AlertDialog.Builder(a).setTitle("Bloquear consultas").setView(scroll(a,column)).setNegativeButton("Cancelar",null).setPositiveButton("Adicionar",null).create();dialog.show();
        dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener(){public void onClick(View view){String h=host.getText().toString().trim().toLowerCase(Locale.US),p=path.getText().toString().trim(),m=method.getText().toString().trim().toUpperCase(Locale.US);if(h.length()==0||h.contains("/")||h.contains(":")||h.contains("*")||h.contains(" ")){host.setError("Informe somente o host exato.");return;}if(!p.startsWith("/")||p.contains("?")||p.contains("#")){path.setError("Informe um caminho iniciado em /, sem parâmetros.");return;}if(!m.equals("*")&&!m.matches("[A-Z]+")){method.setError("Use * ou um método, como GET ou POST.");return;}try{JSONObject rule=new JSONObject();rule.put("kind","request");rule.put("enabled",true);rule.put("host",h);rule.put("path",p);rule.put("method",m);setRule(a,rule);dialog.dismiss();changed.run();}catch(Exception failure){error(a);}}});
    }
    private static void export(Activity a){
        String phase="salvar o arquivo";
        try{
            JSONObject current=snapshot(a);
            String value=current.toString(2);
            java.io.File directory=a.getExternalFilesDir("mint-debugger");
            if(directory==null)throw new IllegalStateException("Armazenamento indisponível");
            directory.mkdirs();
            java.io.File file=null;
            JSONArray currentEvents=current.optJSONArray("events");
            if(currentEvents==null||currentEvents.length()==0){
                java.io.File[] saved=directory.listFiles();
                if(saved!=null)for(java.io.File candidate:saved){
                    if(candidate.isFile()&&candidate.getName().matches("mint-depurador-[0-9]+\\.json")&&candidate.length()>0&&(file==null||candidate.lastModified()>file.lastModified()))file=candidate;
                }
            }
            if(file==null){
                file=new java.io.File(directory,"mint-depurador-"+System.currentTimeMillis()+".json");
                java.io.FileOutputStream output=new java.io.FileOutputStream(file);
                try{output.write(value.getBytes("UTF-8"));}finally{output.close();}
            }
            phase="preparar o compartilhamento";
            Class<?> provider=Class.forName("androidx.core.content.FileProvider");
            Method method;
            try{method=provider.getMethod("getUriForFile",Context.class,String.class,java.io.File.class);}
            catch(NoSuchMethodException obfuscated){method=provider.getMethod("e",Context.class,String.class,java.io.File.class);}
            Uri uri=(Uri)method.invoke(null,a,"com.miui.browser.mini.fileprovider",file);
            Intent send=new Intent(Intent.ACTION_SEND);send.setType("application/json");
            send.putExtra(Intent.EXTRA_SUBJECT,"Registro do depurador Mint");send.putExtra(Intent.EXTRA_STREAM,uri);
            send.setClipData(android.content.ClipData.newRawUri("Registro Mint",uri));send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            phase="abrir o compartilhamento";
            a.startActivity(Intent.createChooser(send,"Exportar registro JSON"));
        }catch(Exception failure){Throwable cause=failure;while(cause.getCause()!=null&&cause.getCause()!=cause)cause=cause.getCause();Toast.makeText(a,"Falha ao "+phase+": "+cause.getClass().getSimpleName(),Toast.LENGTH_LONG).show();}
    }

    private static LinearLayout column(Activity a){LinearLayout column=new LinearLayout(a);column.setOrientation(LinearLayout.VERTICAL);int pad=dp(a,14);column.setPadding(pad,dp(a,8),pad,dp(a,18));return column;}
    private static ScrollView scroll(Activity a,LinearLayout column){ScrollView scroll=new ScrollView(a);scroll.addView(column,new ScrollView.LayoutParams(-1,-2));return scroll;}
    private static TextView text(Activity a,String value,int size){TextView view=new TextView(a);view.setText(value);view.setTextSize(size);view.setTextColor(0xff263b37);return view;}
    private static void note(Activity a,LinearLayout parent,String value){TextView note=text(a,value,13);note.setPadding(0,dp(a,6),0,dp(a,10));parent.addView(note);}
    private static LinearLayout row(Activity a,LinearLayout parent){LinearLayout row=new LinearLayout(a);row.setOrientation(LinearLayout.HORIZONTAL);parent.addView(row,new LinearLayout.LayoutParams(-1,-2));return row;}
    private static void button(Activity a,LinearLayout parent,String title,View.OnClickListener click){Button button=new Button(a);button.setText(title);button.setMinHeight(dp(a,48));button.setOnClickListener(click);parent.addView(button,new LinearLayout.LayoutParams(-1,-2));}
    private static void smallButton(Activity a,LinearLayout parent,String title,View.OnClickListener click){Button button=new Button(a);button.setText(title);button.setTextSize(12);button.setMinHeight(dp(a,48));button.setOnClickListener(click);parent.addView(button,new LinearLayout.LayoutParams(0,-2,1));}
    private static EditText field(Activity a,LinearLayout parent,String title,String value){note(a,parent,title);EditText field=new EditText(a);field.setSingleLine(true);field.setText(value);field.setContentDescription(title);parent.addView(field,new LinearLayout.LayoutParams(-1,-2));return field;}
    private static void size(Activity a,AlertDialog dialog){if(dialog.getWindow()!=null)dialog.getWindow().setLayout(-1,(int)(a.getResources().getDisplayMetrics().heightPixels*.82f));}
    private static int dp(Activity a,int value){return (int)(value*a.getResources().getDisplayMetrics().density+.5f);}
}
