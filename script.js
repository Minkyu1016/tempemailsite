
const ADMIN_ID = "minkyu4635";
const ADMIN_PASS = "mint3614";
let token = "", address = "", accountId = "";

function login() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  if (user === ADMIN_ID && pass === ADMIN_PASS) {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("admin-box").style.display = "block";
    document.getElementById("welcome").innerText = "민규님 어서오세요!";
  } else {
    document.getElementById("error").innerText = "아이디 또는 비밀번호가 올바르지 않습니다.";
  }
}

async function generateEmail() {
  try {
    const domRes = await fetch("https://api.mail.tm/domains");
    const domData = await domRes.json();
    const domain = domData["hydra:member"][0].domain;
    const username = Math.random().toString(36).substring(2, 11);
    const emailAddr = \`\${username}@\${domain}\`;
    const password = "P@ssw0rd123";

    const regRes = await fetch("https://api.mail.tm/accounts", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ address: emailAddr, password })
    });
    const regData = await regRes.json();
    if (regData["hydra:description"]) throw new Error(regData["hydra:description"]);

    accountId = regData.id;

    const tokenRes = await fetch("https://api.mail.tm/token", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ address: emailAddr, password })
    });
    const tokenData = await tokenRes.json();
    token = tokenData.token;

    address = emailAddr;
    document.getElementById("email").innerText = address;

    fetchMailList();
  } catch (err) {
    alert("이메일 생성 중 오류 발생: " + err.message);
  }
}

async function fetchMailList() {
  if (!token) return;

  try {
    const res = await fetch("https://api.mail.tm/messages", {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    const data = await res.json();
    const mails = data["hydra:member"];
    const mailListDiv = document.getElementById("mail-list");
    mailListDiv.innerHTML = "";

    if (!Array.isArray(mails) || mails.length === 0) {
      mailListDiv.innerText = "받은 메일이 없습니다.";
      return;
    }

    mails.forEach(mail => {
      const div = document.createElement("div");
      div.innerText = \`[\${mail.from.address}] \${mail.subject}\`;
      div.onclick = () => fetchMailContent(mail.id);
      mailListDiv.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    document.getElementById("mail-list").innerText = "메일 불러오기 실패";
  }
}

async function fetchMailContent(id) {
  if (!token) return;
  try {
    const res = await fetch(\`https://api.mail.tm/messages/\${id}\`, {
      headers: { Authorization: \`Bearer \${token}\` }
    });
    const mail = await res.json();
    const content = \`보낸 사람: \${mail.from.address}\n제목: \${mail.subject}\n\n\${mail.text || "(본문 없음)"}\`;
    document.getElementById("mail-content").innerText = content;
  } catch (err) {
    console.error(err);
    document.getElementById("mail-content").innerText = "메일 내용을 불러오는 중 오류가 발생했습니다.";
  }
}
