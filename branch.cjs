const { execSync } = require("child_process");
const { MultiSelect } = require("enquirer");

// Git 브랜치 목록을 가져오는 함수
function getGitBranches() {
  try {
    // `git branch` 명령을 실행하여 브랜치 목록을 가져옴
    const output = execSync("git branch", { encoding: "utf-8" });
    // 개행 문자로 분할하여 각 브랜치 이름을 추출
    const branches = output.split("\n").map((branch) => branch.trim());
    // 빈 문자열을 제외하고 브랜치 목록 반환
    return branches.filter((branch) => branch !== "");
  } catch (error) {
    console.error("Error while fetching git branches:", error);
    return [];
  }
}

// 현재 체크아웃된 브랜치 이름을 가져오는 함수
function getCurrentBranch() {
  try {
    // `git symbolic-ref --short HEAD` 명령을 실행하여 현재 브랜치 이름을 가져옴
    const output = execSync("git symbolic-ref --short HEAD", {
      encoding: "utf-8",
    });
    return output.trim(); // 개행 문자 제거 후 반환
  } catch (error) {
    console.error("Error while fetching current branch:", error);
    return null;
  }
}

// 사용자에게 브랜치 선택을 받는 함수
async function selectBranches() {
  const branches = getGitBranches();
  const currentBranch = getCurrentBranch();

  // 현재 브랜치를 제외한 나머지 브랜치 선택
  const choices = branches.filter((branch) => branch !== currentBranch);

  // MultiSelect을 사용하여 여러 브랜치 선택
  const cmd = new MultiSelect({
    name: "value",
    message: "Pick branches to delete",
    choices: choices.map((branch) => ({ name: branch, value: branch })),
  });

  try {
    const selectedBranches = await cmd.run();
    console.log("Selected branches:", selectedBranches);
    deleteBranches(selectedBranches);
  } catch (error) {
    console.error("Error while selecting branches:", error);
  }
}

// 브랜치 삭제 함수
function deleteBranches(branches) {
  branches.forEach((branch) => {
    try {
      execSync(`git branch -D ${branch}`);
      console.log(`Deleted branch '${branch}' successfully.`);
    } catch (error) {
      console.error(`Error deleting branch '${branch}':`, error);
    }
  });
}

// 브랜치 선택 함수 실행
selectBranches();
