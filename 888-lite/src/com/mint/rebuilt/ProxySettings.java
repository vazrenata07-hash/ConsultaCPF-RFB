package com.mint.rebuilt;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.text.InputFilter;
import android.text.InputType;
import android.view.View;
import android.view.WindowManager;
import android.widget.ArrayAdapter;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import org.json.JSONObject;

/** Native proxy editor. Applying while disabled stores settings without connecting. */
public final class ProxySettings {
    private static final String[] PROTOCOLS={"http","https","socks5"};
    private ProxySettings(){}
    public static void show(final Activity a) {
        if(a==null||a.isFinishing())return;
        try {
            final JSONObject initial=new JSONObject(ConfigNative.json(a));
            final ScrollView scroll=new ScrollView(a);
            LinearLayout column=new LinearLayout(a);column.setOrientation(LinearLayout.VERTICAL);
            int pad=dp(a,18);column.setPadding(pad,dp(a,8),pad,dp(a,12));
            scroll.addView(column,new ScrollView.LayoutParams(-1,-2));
            TextView info=new TextView(a);info.setTextSize(13);info.setText(initial.optBoolean("proxyEnabled",false)?"O proxy está ativado. Aplicar atualizará a configuração da conexão.":"Configure e use o botão da notificação Proxy para ativar ou desativar.");column.addView(info);
            label(a,column,"Protocolo");
            final Spinner protocol=new Spinner(a);
            ArrayAdapter<String> adapter=new ArrayAdapter<String>(a,android.R.layout.simple_spinner_item,new String[]{"HTTP","HTTPS","SOCKS5"});adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);protocol.setAdapter(adapter);
            String selected=initial.optString("proxyProtocol","http");int position=selected.equalsIgnoreCase("https")?1:selected.equalsIgnoreCase("socks5")?2:0;protocol.setSelection(position);protocol.setContentDescription("Protocolo do proxy");column.addView(protocol,new LinearLayout.LayoutParams(-1,dp(a,48)));
            final EditText host=field(a,column,"Host ou IP",initial.optString("proxyHost",""),InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_URI,255);host.setHint("Host ou IP, sem protocolo e sem porta");
            int storedPort=initial.optInt("proxyPort",0);
            final EditText port=field(a,column,"Porta",storedPort==0?"":String.valueOf(storedPort),InputType.TYPE_CLASS_NUMBER,5);port.setHint("1 a 65535");
            final EditText username=field(a,column,"Usuário (opcional)",initial.optString("proxyUsername",""),InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD,1024);
            final EditText password=field(a,column,"Senha (opcional)",initial.optString("proxyPassword",""),InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD,1024);
            final TextView status=new TextView(a);status.setTextSize(13);status.setTextColor(0xffb32b2b);status.setPadding(0,dp(a,10),0,0);column.addView(status);
            TextView note=new TextView(a);note.setTextSize(12);note.setText("As credenciais ficam salvas apenas no aplicativo e não são enviadas aos scripts das páginas. SOCKS5: usuário e senha juntos, com até 255 bytes UTF-8 por campo, ou ambos vazios.");column.addView(note);
            final AlertDialog dialog=new AlertDialog.Builder(a).setTitle("Proxy").setView(scroll).setNegativeButton("Cancelar",null).setPositiveButton("Aplicar",null).create();
            dialog.show();dialog.getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
            dialog.getButton(DialogInterface.BUTTON_POSITIVE).setOnClickListener(new View.OnClickListener(){public void onClick(View view){
                try {
                    String rawPort=port.getText().toString().trim();int number=0;
                    if(rawPort.length()>0)try{number=Integer.parseInt(rawPort);}catch(NumberFormatException invalid){port.setError("Use uma porta de 1 a 65535.");return;}
                    JSONObject current=new JSONObject(ConfigNative.json(a));
                    // Preserve the current enabled state: this editor never turns a saved-only proxy on.
                    ProxyConfig next=new ProxyConfig(current.optBoolean("proxyEnabled",false),PROTOCOLS[protocol.getSelectedItemPosition()],host.getText().toString(),number,username.getText().toString(),password.getText().toString());
                    next.writeTo(current);
                    if(!ConfigNative.save(a,current.toString())){status.setText("Não foi possível aplicar o proxy. A configuração anterior foi mantida.");return;}
                    Toast.makeText(a,"Configurações do proxy salvas.",Toast.LENGTH_SHORT).show();dialog.dismiss();
                }catch(IllegalArgumentException invalid){status.setText(invalid.getMessage()==null?"Confira a configuração do proxy.":invalid.getMessage());}
                 catch(Exception unavailable){status.setText("Não foi possível salvar. Confira os campos e tente novamente.");}
            }});
        }catch(Exception unavailable){Toast.makeText(a,"Não foi possível abrir a configuração de proxy.",Toast.LENGTH_SHORT).show();}
    }
    private static EditText field(Activity a,LinearLayout column,String title,String value,int inputType,int limit){
        label(a,column,title);EditText edit=new EditText(a);edit.setInputType(inputType);edit.setSingleLine(true);edit.setTextSize(15);edit.setFilters(new InputFilter[]{new InputFilter.LengthFilter(limit)});edit.setText(value);edit.setSelectAllOnFocus(true);edit.setContentDescription(title);edit.setMinimumHeight(dp(a,48));column.addView(edit,new LinearLayout.LayoutParams(-1,-2));return edit;
    }
    private static void label(Activity a,LinearLayout column,String value){TextView label=new TextView(a);label.setText(value);label.setTextSize(13);label.setPadding(0,dp(a,14),0,dp(a,3));column.addView(label);}
    private static int dp(Activity a,int value){return (int)(value*a.getResources().getDisplayMetrics().density+.5f);}
}
