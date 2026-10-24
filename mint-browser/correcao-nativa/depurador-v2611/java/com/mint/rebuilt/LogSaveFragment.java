package com.mint.rebuilt;

import android.app.Activity;
import android.app.Fragment;
import android.app.FragmentManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;

/** Receives the Android Save As result without replacing the browser Activity. */
public final class LogSaveFragment extends Fragment {
    private static final String TAG = "mint_save_log_document";
    private static final int CREATE_LOG = 26112;
    private boolean pickerLaunched;
    public LogSaveFragment() {}

    public static void save(Activity activity, File source) {
        FragmentManager manager = activity.getFragmentManager();
        if (manager.findFragmentByTag(TAG) != null) {
            Toast.makeText(activity,"Uma janela de salvamento já está aberta.",Toast.LENGTH_SHORT).show();
            return;
        }
        LogSaveFragment receiver = new LogSaveFragment();
        Bundle args = new Bundle();
        args.putString("source",source.getAbsolutePath());
        receiver.setArguments(args);
        manager.beginTransaction().add(receiver,TAG).commitAllowingStateLoss();
        manager.executePendingTransactions();
        receiver.launchPicker();
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        setRetainInstance(true);
        if(state!=null)pickerLaunched=state.getBoolean("pickerLaunched",false);
    }
    @Override public void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        state.putBoolean("pickerLaunched",pickerLaunched);
    }
    private void launchPicker() {
        if(pickerLaunched)return;
        Intent create=new Intent(Intent.ACTION_CREATE_DOCUMENT);
        create.addCategory(Intent.CATEGORY_OPENABLE);
        create.setType("application/json");
        create.putExtra(Intent.EXTRA_TITLE,"mint-log.json");
        try {
            pickerLaunched=true;
            startActivityForResult(create,CREATE_LOG);
        } catch(Exception failure) {
            notifyResult("Não foi possível abrir Salvar como: "+failure.getClass().getSimpleName());
            remove();
        }
    }
    @Override public void onActivityResult(int requestCode,int resultCode,Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if(requestCode!=CREATE_LOG)return;
        if(resultCode!=Activity.RESULT_OK||data==null||data.getData()==null){remove();return;}
        Activity owner=getActivity();
        if(owner==null)return;
        final Context app=owner.getApplicationContext();
        final Uri target=data.getData();
        final String source=getArguments().getString("source");
        new Thread(new Runnable(){public void run(){
            String result;
            try {
                File file=new File(source).getCanonicalFile();
                File folder=app.getExternalFilesDir("mint-debugger");
                if(folder==null||!file.getPath().startsWith(folder.getCanonicalPath()+File.separator)||!file.isFile())throw new IllegalArgumentException("Arquivo de origem indisponível");
                if(!"content".equals(target.getScheme()))throw new IllegalArgumentException("Destino inválido");
                try(InputStream input=new FileInputStream(file);OutputStream output=app.getContentResolver().openOutputStream(target,"w")){
                    if(output==null)throw new java.io.IOException("Destino sem acesso de escrita");
                    byte[] buffer=new byte[16384];int n;
                    while((n=input.read(buffer))!=-1)output.write(buffer,0,n);
                    output.flush();
                }
                result="Log salvo na pasta escolhida. Anexe o JSON nesta conversa.";
            }catch(Exception failure){result="Falha ao gravar o log: "+failure.getClass().getSimpleName()+". O original continua guardado no Mint.";}
            final String message=result;
            Activity current=getActivity();
            if(current!=null)current.runOnUiThread(new Runnable(){public void run(){notifyResult(message);remove();}});
        }},"MintSaveLog").start();
    }
    private void notifyResult(String value) {
        Activity activity=getActivity();
        if(activity!=null)Toast.makeText(activity,value,Toast.LENGTH_LONG).show();
    }
    private void remove() {
        FragmentManager manager=getFragmentManager();
        if(manager!=null)manager.beginTransaction().remove(this).commitAllowingStateLoss();
    }
}
