import fs from "fs";
import path from "path";
import { spawn } from "child_process";

export const executeCode = (language, code, input = "") => {
  return new Promise((resolve) => {
    const tempDir = path.join(process.cwd(), "temp", "codeduel");

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let command;
    let args;

    if (language === "javascript") {
      const filePath = path.join(tempDir, "main.js");

      fs.writeFileSync(filePath, code);

      command = "node";
      args = [filePath];
    } else if (language === "python") {
      const filePath = path.join(tempDir, "main.py");

      fs.writeFileSync(filePath, code);

      command = "python";
      args = [filePath];
    } else if (language === "cpp") {
      const cppFile = path.join(tempDir, "main.cpp");
      const exeFile = path.join(tempDir, "main.exe");

      fs.writeFileSync(cppFile, code);

      const compiler = spawn("g++", [cppFile, "-o", exeFile]);

      let compileError = "";

      compiler.stderr.on("data", (data) => {
        compileError += data.toString();
      });

      compiler.on("close", (compileCode) => {
        if (compileCode !== 0) {
          return resolve(compileError || "Compilation Error");
        }

        runExecutable(exeFile);
      });

      return;
    } else {
      return resolve("Language not supported");
    }

    runProcess(command, args);

    function runExecutable(exeFile) {
      runProcess(exeFile, []);
    }

    function runProcess(command, args) {
      const child = spawn(command, args);

      let stdout = "";
      let stderr = "";

      const timeout = setTimeout(() => {
        child.kill("SIGTERM");
        resolve("Time Limit Exceeded");
      }, 5000);

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      if (input) {
        child.stdin.write(input);
      }

      child.stdin.end();

      child.on("close", () => {
        clearTimeout(timeout);

        if (stderr) {
          return resolve(stderr);
        }

        resolve(stdout || "No Output");
      });
    }
  });
};
