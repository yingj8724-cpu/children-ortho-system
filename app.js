// 问卷及分数
const QUESTIONS = [
  { key: 4,  text: "孩子是否经常张口呼吸",                 score: 3 },
  { key: 5,  text: "孩子是否存在下巴后缩",                   score: 3 },
  { key: 6,  text: "孩子是否有地包天",                       score: 3 },
  { key: 7,  text: "孩子是否有明显龅牙",                     score: 2 },
  { key: 8,  text: "笑时是否露牙龈较多",                     score: 1 },
  { key: 9,  text: "脸型是否左右不对称",                     score: 3 },
  { key:10,  text: "牙齿是否明显拥挤",                       score: 2 },
  { key:11,  text: "牙齿是否有较大缝隙",                     score: 1 },
  { key:12,  text: "牙齿排列是否不整齐",                     score: 1 },
  { key:13,  text: "上下牙齿是否咬合不好",                   score: 1 },
  { key:14,  text: "是否存在反咬",                           score: 3 },
  { key:15,  text: "是否深覆合",                             score: 2 },
  { key:16,  text: "是否开合",                               score: 3 },
  { key:17,  text: "是否有吮指习惯",                         score: 3 },
  { key:18,  text: "是否咬嘴唇",                             score: 3 },
  { key:19,  text: "是否咬笔或玩具",                         score: 3 },
  { key:20,  text: "是否偏侧咀嚼",                           score: 3 },
  { key:21,  text: "是否长期使用安抚奶嘴",                   score: 3 },
  { key:22,  text: "是否舌头顶牙",                           score: 3 },
  { key:23,  text: "是否磨牙",                               score: 1 },
  { key:24,  text: "是否打鼾",                               score: 3 },
  { key:25,  text: "是否睡觉张嘴",                           score: 3 },
  { key:26,  text: "是否吞咽异常",                           score: 3 },
  { key:27,  text: "是否发音不清",                           score: 1 },
  { key:28,  text: "是否咀嚼效率差",                         score: 1 },
  { key:29,  text: "是否感觉牙齿越来越不整齐",               score: 1 },
  { key:30,  text: "是否担心孩子面型发育问题",               score: 1 },
];

const HIGH_RISK_KEYS = [4,5,6,9,14,16,17,18,19,20,21,22,24,25,26];

const APP = document.getElementById('app');

let state = {
  step: 0, // 0 - home, 1 - info, 2 - question, 3 - upload, 4 - result
  age: "",
  phone: "",
  mixedStage: "",     // 是否处于换牙期 yes/no
  orthoEval: "",      // 是否曾进行过正畸评估 yes/no
  answers: {},
  questionIndex: 0,   // 当前题目下标（一题一页）
  photoUrl: "",
  aiFindings: [],
  totalScore: 0,
  riskLevel: "",
  highRiskReasons: [],
  date: "",
};

// ----------- Utils -----------
function saveRecord(data) {
  // 存本地
  let recs = [];
  try { recs = JSON.parse(localStorage.getItem('screenRecords')) || []; } catch(e) {}
  recs.push(data);
  localStorage.setItem('screenRecords', JSON.stringify(recs));
}
function formatDate(ts = Date.now()) {
  const dt = new Date(ts);
  return `${dt.getFullYear()}-${(dt.getMonth()+1).toString().padStart(2,'0')}-${dt.getDate().toString().padStart(2,'0')} ${dt.getHours().toString().padStart(2,'0')}:${dt.getMinutes().toString().padStart(2,'0')}`;
}

// -------- 渲染 ---------
function render() {
  document.body.classList.toggle('result-page', state.step === 4);
  switch(state.step) {
    case 0: renderHome(); break;
    case 1: renderInfo(); break;
    case 2: renderQuestionnaire(); break;
    case 3: renderPhotoUpload(); break;
    case 4: renderResult(); break;
    default: state.step = 0; renderHome();
  }
}

// 首页
function renderHome() {
  APP.innerHTML = `
    <div class="card">
      <h1>儿童咬合发育自测</h1>
      <div style="font-size:1.1rem; margin-bottom:1.2rem; color:#3A86FF;">3分钟了解孩子是否需要早期矫正</div>
      <button class="btn" id="startBtn">开始评估</button>
    </div>
  `;
  document.getElementById('startBtn').onclick = () => {
    state.step = 1; render();
  };
}

// 基本信息
function renderInfo() {
  APP.innerHTML = `
    <div class="card">
      <h2>基本信息</h2>
      <form id="infoForm">
        <label>孩子年龄：</label>
        <input type="number" min="2" max="16" required id="ageInput" placeholder="如：7" value="${state.age||''}" />
        <div style="margin:0.6rem 0 0.25rem 0;">孩子是否处于换牙期：</div>
        <div class="radio-group">
          <input type="radio" id="mixed_yes" name="mixedStage" value="yes" ${state.mixedStage==='yes'?'checked':''} />
          <label for="mixed_yes">是</label>
          <input type="radio" id="mixed_no" name="mixedStage" value="no" ${state.mixedStage==='no'?'checked':''} />
          <label for="mixed_no">否/不清楚</label>
        </div>
        <div style="margin:0.4rem 0 0.25rem 0;">是否曾进行过正畸评估：</div>
        <div class="radio-group">
          <input type="radio" id="ortho_yes" name="orthoEval" value="yes" ${state.orthoEval==='yes'?'checked':''} />
          <label for="ortho_yes">是</label>
          <input type="radio" id="ortho_no" name="orthoEval" value="no" ${state.orthoEval==='no'?'checked':''} />
          <label for="ortho_no">否</label>
        </div>
        <button class="btn" type="submit">下一步</button>
      </form>
    </div>
  `;
  document.getElementById('infoForm').onsubmit = function(e){
    e.preventDefault();
    const age = document.getElementById('ageInput').value.trim();
    const mixed = document.querySelector('input[name="mixedStage"]:checked');
    const ortho = document.querySelector('input[name="orthoEval"]:checked');
    if(!age || !mixed || !ortho) {
      alert('请填写完整的基本信息');
      return;
    }
    state.age = age;
    state.mixedStage = mixed.value;
    state.orthoEval = ortho.value;
    state.questionIndex = 0;
    state.step = 2; render();
  };
}

// 筛查问卷（一题一页，选择“是”或“否”）
function renderQuestionnaire() {
  const idx = Math.min(Math.max(0, state.questionIndex), QUESTIONS.length - 1);
  state.questionIndex = idx;
  const q = QUESTIONS[idx];
  const curr = state.answers[q.key] || "";
  const progress = `第 ${idx + 1} / ${QUESTIONS.length} 题`;

  APP.innerHTML = `
    <div class="card">
      <h2>筛查问卷</h2>
      <div class="question-progress">${progress}</div>
      <div class="question-text">${q.text}</div>
      <div class="question-score">（本题分值 ${q.score}）</div>
      <div class="question-choices">
        <button type="button" class="btn choice-btn" id="choiceYes">是</button>
        <button type="button" class="btn secondary choice-btn" id="choiceNo">否</button>
      </div>
      ${idx > 0 ? '<button type="button" class="btn secondary" id="prevQ" style="margin-top:0.6rem;">上一题</button>' : ''}
    </div>
  `;

  function goNext() {
    if (idx >= QUESTIONS.length - 1) {
      // 最后一题：计算分数并进入下一步
      const answers = state.answers;
      let totalScore = 0, highRiskReasons = [];
      QUESTIONS.forEach(qq => {
        if (answers[qq.key] === "yes") {
          totalScore += qq.score;
          if (HIGH_RISK_KEYS.includes(qq.key)) highRiskReasons.push('Q' + qq.key + ' ' + qq.text);
        }
      });
      let riskLevel = '低风险';
      if (highRiskReasons.length > 0 || totalScore >= 26) riskLevel = "高风险";
      else if (totalScore >= 15) riskLevel = "中度风险";
      else if (totalScore >= 7) riskLevel = "轻度风险";
      state.totalScore = totalScore;
      state.highRiskReasons = highRiskReasons;
      state.riskLevel = riskLevel;
      state.date = formatDate();
      state.step = 3;
      render();
    } else {
      state.questionIndex = idx + 1;
      render();
    }
  }

  document.getElementById('choiceYes').onclick = () => {
    state.answers[q.key] = 'yes';
    goNext();
  };
  document.getElementById('choiceNo').onclick = () => {
    state.answers[q.key] = 'no';
    goNext();
  };
  const prevBtn = document.getElementById('prevQ');
  if (prevBtn) prevBtn.onclick = () => {
    state.questionIndex = idx - 1;
    render();
  };
}

// 上传照片
function renderPhotoUpload() {
  APP.innerHTML = `
    <div class="card">
      <h2>牙齿照片上传</h2>
      <div style="font-size:1rem; margin-bottom:1rem;">可使用手机拍照或相册上传</div>
      <input type="file" id="photoFile" accept="image/*" capture="environment" />
      <div id="imgPreview"></div>
      <form id="aijudge">
        <div style="margin:1rem 0 0.2rem 0;">照片发现：</div>
        <div class="checkbox-group">
          <input type="checkbox" id="ai1" value="龅牙" name="ai_chk" />
          <label for="ai1">龅牙</label>
          <input type="checkbox" id="ai2" value="地包天" name="ai_chk" />
          <label for="ai2">地包天</label>
          <input type="checkbox" id="ai3" value="牙齿拥挤" name="ai_chk" />
          <label for="ai3">牙齿拥挤</label>
          <input type="checkbox" id="ai4" value="其他" name="ai_chk" />
          <label for="ai4">其他</label>
        </div>
      </form>
      <button class="btn" id="photoNext">生成报告</button>
    </div>
  `;
  // 预览图片
  document.getElementById('photoFile').onchange = function(e){
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
      state.photoUrl = evt.target.result;
      document.getElementById('imgPreview').innerHTML = `<img src="${state.photoUrl}" alt="牙齿" class="preview">`;
    };
    reader.readAsDataURL(file);
  };
  document.getElementById('photoNext').onclick = ()=>{
    let aiChk = [];
    document.querySelectorAll('input[name="ai_chk"]:checked').forEach(c=>{
      aiChk.push(c.value);
    });
    state.aiFindings = aiChk;
    state.step = 4; render();
  };
}

// 结果页面
function renderResult() {
  // 触发原因
  let reasons = state.highRiskReasons.length ? state.highRiskReasons.join('；') : '无';
  // 推荐
  let suggest = "建议定期关注口腔发育情况";
  if(state.riskLevel==="高风险" || state.aiFindings.length){
    suggest = "建议尽早进行儿童正畸专业评估。最佳干预年龄：5-10岁。";
  }
  // 医学解释
  const explanation = {
    "高风险": "您的孩子存在多项高风险表现，可能有牙颌及颅面发育异常倾向，建议及时至正畸专科就诊。",
    "中度风险": "部分筛查项为异常，应加强关注，必要时进行专业随访。",
    "轻度风险": "表现为轻微异常，请持续关注孩子口腔发育。",
    "低风险": "当前表现基本正常，建议口腔定期检查。"
  }[state.riskLevel] || '';
  // AI提示
  let aiTip = "";
  if(state.aiFindings.length){
    aiTip = `<div style="color:#ff6e00; margin-top:0.8rem;"><b>照片发现：</b>${state.aiFindings.join("、")}，建议尽早进行专业检查。</div>`;
  }

  APP.innerHTML = `
    <div class="card result-report">
      <h2>儿童牙颌发育评估报告</h2>
      <div class="result-row"><b>孩子年龄：</b>${state.age}</div>
      <div class="result-row"><b>评估时间：</b>${state.date}</div>
      <div class="result-row"><b>总评分：</b>${state.totalScore} / 57 &nbsp; <b>风险等级：</b><span style="color:${state.riskLevel==='高风险'?'#e14641': state.riskLevel==='中度风险'?'#e89919':'#197545'}">${state.riskLevel}</span></div>
      <div class="result-section">
        <div class="result-label">根据问卷评估结果，孩子可能存在以下问题：</div>
        <div class="result-value">${reasons}</div>
      </div>
      <div class="result-section">
        <div class="result-label">医学解释：</div>
        <div class="result-value">${explanation}</div>
      </div>
      <div class="result-section">
        <div class="result-label">这些情况在儿童发育阶段较为常见，但如果不及时干预，可能影响：</div>
        <ul class="result-list">
          <li>面型发育</li>
          <li>牙齿排列</li>
          <li>咬合功能</li>
        </ul>
      </div>
      <div class="result-section">
        <div class="result-label">干预建议：</div>
        <ol class="result-list result-list-ol">
          <li>建议到正畸专科进行检查</li>
          <li>必要时拍摄口腔影像</li>
          <li>根据生长发育情况评估是否需要早期矫正</li>
        </ol>
      </div>
      ${state.photoUrl ? `<img src="${state.photoUrl}" class="preview">`:""}
      ${aiTip}
      <div class="result-tip">
        <div class="result-tip-title">温馨提示</div>
        <div>3-12岁是牙颌发育关键阶段，定期口腔检查有助于及时发现问题。</div>
      </div>
      <div class="report-actions" style="margin:1.2rem 0 0.25rem 0;">
        <button class="btn" id="saveBtn">生成PDF/打印</button>
        <button class="btn secondary" id="shareBtn">分享给家人</button>
        <button class="btn" id="appointBtn">预约检查</button>
        <button class="btn secondary" id="restartBtn" style="margin-top:0.7rem;">重新评估</button>
      </div>
    </div>
  `;
  // 保存记录到localStorage
  saveRecord({
    date: state.date,
    age: state.age,
    phone: state.phone,
    mixedStage: state.mixedStage,
    orthoEval: state.orthoEval,
    answers: state.answers,
    totalScore: state.totalScore,
    riskLevel: state.riskLevel,
  });
  // 事件绑定
  document.getElementById('saveBtn').onclick = () => {
    window.print();
  };
  document.getElementById('shareBtn').onclick = () => {
    const reportCard = document.querySelector('#app .card');
    if (!reportCard) return;
    const clone = reportCard.cloneNode(true);
    const actions = clone.querySelector('.report-actions');
    if (actions) actions.remove();
    const filename = `儿童牙颌发育评估报告_${state.age}岁_${state.date.replace(/[\s:-]/g,'').slice(0,8)}.pdf`;
    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(clone).save().then(() => {
      alert('PDF已生成，可转发到微信分享给家人');
    });
  };
  document.getElementById('appointBtn').onclick = () => {
    const modal = document.getElementById('qr-modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };
  document.getElementById('restartBtn').onclick = () => {
    state = {
      step: 0,
      age: "",
      phone: "",
      mixedStage: "",
      orthoEval: "",
      answers: {},
      questionIndex: 0,
      photoUrl: "",
      aiFindings: [],
      totalScore: 0,
      riskLevel: "",
      highRiskReasons: [],
      date: "",
    };
    render();
  }
}

function setupQrModal() {
  const openBtn = document.getElementById('doctor-contact');
  const modal = document.getElementById('qr-modal');
  const closeBtn = document.getElementById('qr-close');
  if(!openBtn || !modal) return;

  const open = () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  };

  openBtn.addEventListener('click', open);
  closeBtn && closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if(e.target && e.target.dataset && e.target.dataset.close === 'true') close();
  });
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && !modal.classList.contains('hidden')) close();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render();
  setupQrModal();
});
