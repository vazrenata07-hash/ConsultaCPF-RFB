import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.address.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.symbol.*;
import ghidra.program.model.data.*;
import ghidra.program.disassemble.Disassembler;
import java.nio.file.*;
import java.util.*;

public class RecoverTargets extends GhidraScript {
 public void run() throws Exception {
  String[] args=getScriptArgs();
  Path root=Paths.get(args[0]);
  Files.createDirectories(root.resolve("decompiled"));
  for(String line:Files.readAllLines(root.resolve("globals.tsv"))) {
   String[] p=line.split("\t",3); if(p.length<3) continue;
   Address a=toAddr(p[0]);
   try {createLabel(a,p[1],true); createData(a,new PointerDataType()); setEOLComment(a,p[2]);}catch(Exception e){}
  }
  for(String line:Files.readAllLines(root.resolve("helpers.tsv"))) {
   String[] p=line.split("\t"); Address a=toAddr(p[0]);
   if(getFunctionAt(a)==null)try {currentProgram.getFunctionManager().createFunction(p[1],a,new AddressSet(a),SourceType.USER_DEFINED);}catch(Exception e){}
  }
  ArrayList<Function> fs=new ArrayList<>();
  for(String line:Files.readAllLines(root.resolve("targets.tsv"))) {
   String[] p=line.split("\t"); Address a=toAddr(p[0]), z=toAddr(p[1]).subtract(1);
   AddressSet body=new AddressSet(a,z);
   Disassembler.getDisassembler(currentProgram,monitor,null).disassemble(a,body,true);
   Function f=getFunctionAt(a);
   if(f!=null){ f.setBody(body); f.setName(p[2],SourceType.USER_DEFINED); }
   else f=currentProgram.getFunctionManager().createFunction(p[2],a,body,SourceType.USER_DEFINED);
   if(f!=null){
    f.setReturnType(new PointerDataType(),SourceType.USER_DEFINED);
    f.replaceParameters(Function.FunctionUpdateType.DYNAMIC_STORAGE_ALL_PARAMS,true,SourceType.USER_DEFINED,
      new ParameterImpl("tstate",new PointerDataType(),currentProgram),
      new ParameterImpl("self",new PointerDataType(),currentProgram),
      new ParameterImpl("python_pars",new PointerDataType(new PointerDataType()),currentProgram));
    fs.add(f);
   }
   println("PREPARED "+p[2]+" "+a+" "+z);
  }
  DecompInterface d=new DecompInterface();
  DecompileOptions options=new DecompileOptions();
  options.grabFromProgram(currentProgram); d.setOptions(options);
  d.toggleCCode(true);d.toggleSyntaxTree(false);d.setSimplificationStyle("decompile");
  d.openProgram(currentProgram);
  for(Function f:fs){
   println("DECOMPILING "+f.getName());
   DecompileResults r=d.decompileFunction(f,40,monitor);
   Path out=root.resolve("decompiled").resolve(f.getName()+".c");
   String source=r.decompileCompleted()?r.getDecompiledFunction().getC():"/* FAILED: "+r.getErrorMessage()+" */";
   Files.writeString(out,source);println("SAVED "+out);
  }
  d.dispose();
 }
}
