/**
 * CoC6/7版のフラグ管理用変数
 * @type {Boolean} 6版:true, 7版:false
 */
let coc6th = true;

/**
 * 技能テーブル用の情報を格納しておくリスト
 * @type {Array}
 * @type 判定の種類\n
 *  - choice : チョイス
 *  - roll : 通常の判定
 *  - dice : 1d3など、振るダイスが直接記述されているもの
 *  - elseRoll : 対抗ロール・正気度ロールなど、判定だが振るダイスが直接記述されているもの
 * @name 技能名
 * @value 技能値・判定部分のテキスト
 * @times **繰り返す回数
 * @noname **技能名をチャパレに表示しない設定
*/
let skillList = [];

/**
 * チャパレ用の情報を格納しておくリスト
 * @type {Array}
 * @type 判定の種類\n
 *  - choice : チョイス
 *  - roll : 通常の判定
 *  - dice : 1d3など、振るダイスが直接記述されているもの
 *  - elseRoll : 対抗ロール・正気度ロールなど、判定だが振るダイスが直接記述されているもの
 *  - line : セパレータ
 * @name 技能名
 * @value 技能値・判定部分のテキスト
 * @times **繰り返す回数
 * @checked **除外チェックボックスのON/OFF設定
 * @noname **技能名をチャパレに表示しない設定
 */
let chatList = [];

// left col
const delCharElement      = document.getElementById('delChar');
const colorElement        = document.getElementById('color');
const colorTextElement    = colorElement.nextElementSibling;
const namePreviewElement  = document.getElementsByClassName('ccfoliaName')[0];
const unitSizeElement     = document.getElementById('unitSize');
const unitSizeTextElement = unitSizeElement.nextElementSibling;
const memoElement         = document.getElementById('memo');
const diffElement         = document.getElementById('diff');
const ccfoUnitElement     = document.getElementById('ccfoUnit');

// middle col
const systemElements = Array.from(document.getElementsByName('system'));
const diceElements   = Array.from(document.getElementsByName('dice'));
const dice2Elements  = Array.from(document.getElementsByName('dice2'));
const sDiceCheckbox   = document.getElementById('sDice');
const sChoiceCheckbox = document.getElementById('sChoice');
const addDiffCheckbox = document.getElementById('addDiff');

const statsElement   = document.getElementById('stats');
const skillsElement  = document.getElementById('skills');

// Table
const addParamsTable = document.getElementById('addParamsTable').getElementsByTagName('tbody')[0];
const addStatsTable  = document.getElementById('addStatsTable').getElementsByTagName('tbody')[0];
const paramsTable    = document.getElementById('paramsTable').getElementsByTagName('tbody')[0];
const statsTable     = document.getElementById('statsTable').getElementsByTagName('tbody')[0];
const elseTable      = document.getElementById('elseTable').getElementsByTagName('tbody')[0];
const skillTable     = document.getElementById('skillTable').getElementsByTagName('tbody')[0];
const chatTable      = document.getElementById('chatTable').getElementsByTagName('tbody')[0];

statsElement.placeholder = `STR ... EDU / DB
HP / MP / SAN
アイデア / 幸運 / 知識`;
skillsElement.placeholder = 
`・目星70% 聞き耳40% 図書館25%
・CCB<=50 こぶし（パンチ）

・1d4+db/2

・キック　50% / 1d6+db / 1R1回

・choice(PC1,PC2,PC3)_攻撃対象
・RESB(12-10)_対抗ロール
・CBRB(40,60)_組み合わせロール`;

/* 
// for Test
STR：8 CON：9 POW：10 DEX：11
APP：12 SIZ：13 INT：14 EDU：15
幸運：60　知識：75　ダメージ・
ボーナス：+1D4　MP：50　正気度：20
*/


addRow(addParamsTable,0,true,true);
addRow(addStatsTable, 0,true,true);

statsElement.onchange = () => {
  chatList = remakeChat(skillList);
}
skillsElement.onchange = () => {
  skillList = remakeskillTable();
  chatList = remakeChat(skillList);
}
statsElement.addEventListener( 'input', updateValueTables);
skillsElement.addEventListener('input', remakeskillTable);

// import ccfolia unit
ccfoUnitElement.addEventListener('change', importUnit);

// 初期化ボタン
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click',initialize);
clearButton.onmousedown = (e) => {
  e.currentTarget.style.color = '#eee';
  e.currentTarget.style.backgroundColor = 'rgba(42, 99, 68, 0.9)';
}
clearButton.onmouseup = (e) => {
  e.currentTarget.style.color = '#555';
  e.currentTarget.style.backgroundColor = 'transparent';
}

// 名前
memoElement.onchange = (e) => {
  namePreviewElement.innerText = e.currentTarget.value.split('\n')[0] || '探索者名';
};

// コマサイズ
unitSizeElement.oninput = (e) => {unitSizeTextElement.value = e.currentTarget.value};
unitSizeTextElement.oninput = (e) => {unitSizeElement.value = e.currentTarget.value};

// 発言色
colorElement.oninput = (e) => {
  colorTextElement.value         = e.currentTarget.value;
  namePreviewElement.style.color = e.currentTarget.value;
};
colorTextElement.oninput = (e) => {
  if (/^#?[0-9a-fA-F]{6}$/.test(e.currentTarget.value)) {
    const color = (e.currentTarget.value.charAt(0)=='#'?'':'#') + e.currentTarget.value;
    colorElement.value = color;
    namePreviewElement.style.color = color;
  }
}

// 差分
diffElement.onchange = () => {
  chatList = remakeChat(skillList);
};
addDiffCheckbox.onclick = () => {
  chatList = remakeChat(skillList);
}

// sDice,sChoice
sDiceCheckbox.onclick   = () => {updateChat(chatList)};
sChoiceCheckbox.onclick = () => {updateChat(chatList)};

// system
systemElements.forEach( e => {e.onclick = () => {
  coc6th = Boolean(parseInt(e.value));
  updateValueTables();
  chatList = remakeChat(skillList);
}});

// 消去する文字
delCharElement.onchange = () => {
  updateValueTables();
  skillList = remakeskillTable();
  chatList = remakeChat(skillList);
};

// ダイス設定
diceElements.forEach( e=>{e.onclick = () => updateChat(chatList)});
dice2Elements.forEach(e=>{e.onclick = () => updateChat(chatList)});

// テーブル：✔切り替え
[...paramsTable.children].forEach(row => {row.onclick = (e) => {
  toggleSecretCheckbox(e);
  const i = chatList.findIndex(element=>element.name.startsWith(e.currentTarget.children[1].innerText));
  if (i>-1)  chatTable.children[i].firstElementChild.firstElementChild.checked = e.currentTarget.firstElementChild.firstElementChild.checked;
}});
[...statsTable.children].forEach(row => {row.onclick = (e) => {
  toggleSecretCheckbox(e);
  if (e.currentTarget.children[1].innerText=='SAN') {
    const i = chatList.findIndex(element=>String(element.value).startsWith('1d100<={SAN}'));
    if (i>-1)  chatTable.children[i].firstElementChild.firstElementChild.checked = e.currentTarget.firstElementChild.firstElementChild.checked;
  }
}});

// パラメータ・ステータス追加
document.getElementById('addParam').onclick = () => addRow(addParamsTable,0,true,true);
document.getElementById('addStat').onclick  = () => addRow(addStatsTable, 0,true,true);

// copy to Clipboard
document.getElementById('exUnit').addEventListener('click', exportUnit);
document.getElementById('exChat').onclick = e => copy2clipboard(e.currentTarget, getChatpalette());


/* ----------------------
          関数
---------------------- */

function xor(a,b) {
  if ( a&&!b || (!a)&&b ) return true;
  return false;
}

function normStr(str) {
  str = str.replaceAll(/　/g,' ');
  str = str.replace(/[！-｝]/g, function(s){return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);});
  let pattern = new RegExp(`[${delCharElement.value}]`,'g');
  str = str.replace(pattern,'');
  str = str.replace(/_/g,' ');
  return str;
}

function toggleCheckbox (checkbox) { checkbox.checked = !checkbox.checked }
function toggleSecretCheckbox (e)  { toggleCheckbox(e.target.parentElement.firstElementChild.firstElementChild) }

let startIndex;
function dragStart (e) {startIndex = e.currentTarget.rowIndex-1}
function dragEnter (e) {e.currentTarget.classList.add('insert')}
function dragLeave (e) {e.currentTarget.classList.remove('insert')}
function dragOver  (e) {e.preventDefault()};
function drop(e) {
  e.currentTarget.classList.remove('insert');
  const dropIndex = e.currentTarget.rowIndex-1;
  const table = e.currentTarget.parentElement;
  table.insertBefore(table.children[startIndex],e.currentTarget);
  const startDic = chatList[startIndex];
  chatList.splice(startIndex,1);
  chatList.splice(dropIndex-(startIndex<dropIndex ? 1 : 0), 0, startDic);
}

/**
 * 指定のテーブルに行を追加する関数
 * @param {HTMLTableElement} tbody 行を追加するテーブルのTbodyエレメント
 * @param {Number} thCol ヘッダーにする列の列数 デフォルトは-1(ヘッダーセルを作らない)
 * @param {Boolean} draggable デフォルトfalse
 * @param {Boolean} editable デフォルトfalse
 * @returns {HTMLTableRowElement} 追加した行エレメント
 */
function addRow(tbody, thCol=-1, draggable=false, editable=false) {
  const cols = tbody.parentElement.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0].childElementCount;

  const row = document.createElement('tr');
  if (draggable) {
    row.draggable = true;
    row.addEventListener('dragstart', dragStart);
    row.addEventListener('dragenter', dragEnter);
    row.addEventListener('dragleave', dragLeave);
    row.addEventListener('dragover',  dragOver);
    row.addEventListener('drop',      drop);
  }

  for (let i=0; i<cols; i++) {
    const cell = document.createElement(i==thCol ? 'th' : 'td');
    if (editable)  cell.contentEditable = 'plaintext-only';
    row.appendChild(cell);
  }

  tbody.appendChild(row);
  return row;
}

function initialize () {
  importedUnit = '';
  
  memoElement.value  = '';
  diffElement.value  = '';
  namePreviewElement.innerText = '探索者名';

  delCharElement.value = ' :…「」『』【】〈〉\\[\\]《》≪≫';

  colorElement.value             = '#888888';
  colorTextElement.value         = '#888888';
  namePreviewElement.style.color = '#888888';

  // unitSizeElement.value     = 4;
  // unitSizeTextElement.value = 4;

  // document.getElementById('secret').checked     = false;
  // document.getElementById('invisible').checked  = false;
  // document.getElementById('hideStatus').checked = false;

  statsElement.value    = '';
  skillsElement.value   = '';
  ccfoUnitElement.value = '';

  Array.from(paramsTable.children).forEach(e => e.firstElementChild.firstElementChild.checked = false);
  Array.from(statsTable.children).forEach( e => e.firstElementChild.firstElementChild.checked = false);
  
  addParamsTable.innerHTML = '';
  addStatsTable.innerHTML  = '';
  addRow(addParamsTable,0,true,true);
  addRow(addStatsTable, 0,true,true);

  updateValueTables();
  skillList = remakeskillTable();
  chatList = remakeChat(skillList);

  for (let i=0; i<6; i++) {
    const row = addRow(skillTable,0);
    row.style.height = '1.5rem';
  }
  for (let i=0; i<17; i++) {
    const row = addRow(chatTable);
    row.style.height = '1.5rem';
  }
}

let importedUnit;
function importUnit (e) {
  if (!e.currentTarget.value)  return;
  let unitdata = JSON.parse(e.currentTarget.value);
  if (unitdata.kind!='character')  return;
  
  initialize();
  importedUnit = unitdata;
  console.log(unitdata);

  // name & memo
  memoElement.value = (unitdata.data.name || '') + (unitdata.data.memo ? `\n${unitdata.data.memo}` : '');
  namePreviewElement.innerText = unitdata.data.name;

  // color
  if (unitdata.data.color) {
    colorElement.value     = unitdata.data.color.toLowerCase();
    colorTextElement.value = unitdata.data.color.toLowerCase();
    namePreviewElement.style.color = unitdata.data.color;
  }
  // unit size
  if (unitdata.data.width) {
    unitSizeElement.value     = unitdata.data.width;
    unitSizeTextElement.value = unitdata.data.width;
  }
  // unit setting
  document.getElementById('secret').checked     = unitdata.data.secret;
  document.getElementById('invisible').checked  = unitdata.data.invisible;
  document.getElementById('hideStatus').checked = unitdata.data.hideStatus;

  // face
  if (unitdata.data.faces)  diffElement.value = unitdata.data.faces.filter(e => e.label).map(e => e.label).join('\n');

  // params, status
  statsElement.value = '';
  addParamsTable.innerHTML = '';
  addStatsTable.innerHTML  = '';
  if (unitdata.data.params) {
    statsElement.value += unitdata.data.params.map(e => `${e.label}  ${e.value}`).join('\t')+'\n';
    const extraParams = unitdata.data.params.filter(e => !/STR|CON|POW|DEX|APP|SIZ|INT|EDU|DB/.test(e.label));
    if (extraParams.length) {
      for (let param of extraParams) {
        let row = addRow(addParamsTable,0,true,true);
        row.firstElementChild.innerText = param.label;
        row.lastElementChild.innerText  = param.value;
      }
    } else addRow(addParamsTable,0,true,true);
  }
  if (unitdata.data.status) {
    statsElement.value += unitdata.data.status.map(e => `${e.label}  ${e.max||e.value}`).join('\t');
    let extraStats = unitdata.data.status.filter(e => !/HP|MP|SAN|幸運/.test(e.label));
    if (extraStats.length) {
      for (let stat of extraStats) {
        let row = addRow(addStatsTable,0,true,true);
        row.firstElementChild.innerText = stat.label;
        row.children[1].innerText       = stat.value;
        if (stat.max)  row.lastElementChild.innerText = stat.max;
      }
    } else  addRow(addStatsTable,0,true,true);
  }
  
  // commands
  {
    const arr = [];
    let matchArr = unitdata.data.commands.match(/(\d+).*アイディ?ア|アイディ?ア.*@(\d+)/);
    if(matchArr) arr.push(`アイデア  ${matchArr[1]||matchArr[2]}`);

    matchArr = unitdata.data.commands.match(/(\d+).*幸運|幸運.*@(\d+)/);
    if(matchArr) arr.push(`幸運  ${matchArr[1]||matchArr[2]}`);
    
    matchArr = unitdata.data.commands.match(/(\d+).*知識|知識.*@(\d+)/);
    if(matchArr) arr.push(`知識  ${matchArr[1]||matchArr[2]}`);

    statsElement.value += (arr.length ? '\n' : '') + arr.join('\t');
  }

  skillsElement.value = unitdata.data.commands.replace(/^.*<=\{.*\}.*$/mg,'').replace(/^.*(?:アイディ?ア|幸運|知識).*$/mg,'').replace(/ /g,'_').trim();

  updateValueTables();
  skillList = remakeskillTable();
  chatList = remakeChat(skillList);
}

/**
 * パラメータ/ステータス/他テーブルの数値を更新する関数
 */
function updateValueTables () {
  const props = {};
  const text  = normStr(statsElement.value).replace(/\n/g,'');
  
  // 能力値
  for (let key of ['STR','CON','POW','DEX','APP','SIZ','INT','EDU'] ) {
    props[key.toLowerCase()] = parseInt(text.match(new RegExp(`${key}\\W*(\\d+)`))?.[1]) || null;
  }
  // DB
  props.db = text.match(/(?:DB|ダメージ・?ボーナス)\W*([-D\d]+)/i)?.[1].toLowerCase() || null;
  if( !props.db && props.str && props.siz ) {
    const sum = (props.str + props.siz) / (coc6th ? 1 : 5);
    if      (sum<=16)           props.db = '-1d4';
    else if (sum>16 && sum<=24) props.db = 0;
    else if (sum>24 && sum<=32) props.db = '1d4';
    else if (sum>32 && sum<=40) props.db = '1d6';
    else if (sum>40 && sum<=48) props.db = '2d6';
  }

  paramsTable.children[0].lastElementChild.innerText = props.str;
  paramsTable.children[1].lastElementChild.innerText = props.con;
  paramsTable.children[2].lastElementChild.innerText = props.pow;
  paramsTable.children[3].lastElementChild.innerText = props.dex;
  paramsTable.children[4].lastElementChild.innerText = props.app;
  paramsTable.children[5].lastElementChild.innerText = props.siz;
  paramsTable.children[6].lastElementChild.innerText = props.int;
  paramsTable.children[7].lastElementChild.innerText = props.edu;
  paramsTable.children[8].lastElementChild.innerText = props.db;

  // HP・MP・SAN
  props.hp = parseInt(text.match(/(?:HP|耐久力?)\D*(\d+)/i)?.[1]) || (props.con&&props.siz ? (coc6th ? Math.ceil((props.con+props.siz)/2) : Math.floor((props.con+props.siz)/10)) : null);
  props.mp  = parseInt(text.match(/(?:MP|マジック・?ポイント)\D*(\d+)/i)?.[1]) || props.pow/(coc6th?1:5) || null;
  props.san = parseInt(text.match(/(?:SAN値?|正気度)\D*(\d+)/i)?.[1])         || props.pow*(coc6th?5:1) || null;

  statsTable.children[0].lastElementChild.innerText = props.hp;
  statsTable.children[1].lastElementChild.innerText = props.mp;
  statsTable.children[2].lastElementChild.innerText = props.san;

  // アイデア・幸運・知識
  props.ide  = parseInt(text.match(/(?:ID[AE]|アイディ?ア)\D*(\d+)/i)?.[1]) || props.int*(coc6th?5:1) || null;
  props.luck = parseInt(text.match(/(?:LUCK|幸運)\D*(\d+)/i)?.[1]) || (props.pow&&coc6th ? props.pow*5 : null);
  props.know = parseInt(text.match(/(?:KNOW|知識)\D*(\d+)/i)?.[1]) || props.edu*(coc6th?5:1) || null;
  
  elseTable.children[0].lastElementChild.innerText = props.ide;
  elseTable.children[1].lastElementChild.innerText = props.luck;
  elseTable.children[2].lastElementChild.innerText = props.know;
}

/**
 * skillListを取得・技能テーブルを再作成する関数
 * @returns {Array} skillList
 */
function remakeskillTable () {
  let skillList = [];
  skillTable.innerHTML='';

  let baseArr = normStr(skillsElement.value).split(/\n|%/).filter(Boolean);

  const b = '\\(?(?:\\{?DB\\}?|\\d+D\\d+|\\d+|\\{.*?\\})\\)?';  // db,1d3,2,{...}
  const dicePattern = `${b}(?:[-+*/]${b})*`;
  
  baseArr.forEach(base => {
    let dic, times;

    // 複数回ロール
    if (/^(?:x|rep|repeat)\d+/.test(base)) {
      times = parseInt(base.match(/^(?:x|rep|repeat)(\d+)/)[1]);
      base = base.replace(/(?:x|rep|repeat)\d+ */,'');
    }

    if (/choice|チョイス/i.test(base)) {  // choice
      const text  = base.match(/\((.*)\)/)?.[1] || base.replace(/.*(?:choice|チョイス)/i,'');
      const name  = base.replace(new RegExp(`s?choice|チョイス|\\(?${text}\\)?`,'gi'),'').trim();
      const value = text.split(/[,、 ]/).filter(e=>e).join(',');
      dic = {type:'choice', name:name, value:`choice(${value})`};

    } else if (/(?:CBR|RES)/i.test(base)) {  // 組み合わせ,対抗ロール
      const value = base.match(/(?:CBR|RES).+\)/i)[0];
      const name  = base.replace(value,'').trim();
      dic = {type:'elseRoll', name:name, value:value.toUpperCase()};

    } else if (/(?:1d100|CCB?)<=/i.test(base)) { // CCB<=70 skill
      const pattern = new RegExp(`<=(${dicePattern}) *(.*)`,'i');
      const arr = base.match(pattern);
      dic = {type:'roll', name:arr[2], value:arr[1]};
      
    } else if (/(?:1d100|CCB?).*@\d+$/i.test(base)) { // CCB skill @70
      const arr = base.match(/(?:1d100|CCB?) *(.*) *@(\d+)$/i);
      dic = {type:'roll', name:arr[1], value:arr[2]};

    } else if (/\dD\d/i.test(base)) { // 1d3
      let value = base.match(new RegExp(dicePattern,'i'))[0];
      const name = base.replace(value,'').trim();
      value = value.replace(/\/1$/i,'').replace(/\{?db\}?/gi,'{DB}');
      dic = {type:'dice', name:name, value:value};

    } else {  // skill 70
      const arr = base.match(new RegExp(`(.*?)(${dicePattern})\\D*$`,'i'));
      if (!arr) {
        console.log(`Not add to chat-palette : ${base}`);
        return;
      }
      dic = {type:'roll', name:arr[1].trim(), value:arr[2]};
    }
    if(times)  dic.times = times;

    const row = addRow(skillTable,0);
    row.children[0].innerText = (dic.times ? `x${dic.times} ` : '') + dic.name;
    row.children[1].innerText = dic.value;

    row.children[0].onclick = e => {
      const i = e.currentTarget.parentElement.rowIndex-1;
      const j = chatList.findIndex(e => e.type==skillList[i].type && e.name==skillList[i].name && e.value==skillList[i].value);
      if (e.currentTarget.style.color) {
        e.currentTarget.style.color = null;
        e.currentTarget.style.textDecoration = null;
        skillList[i].noname = false;
        chatList[j].noname  = false;
      } else {
        e.currentTarget.style.color = 'rgba(0,0,0,0.33)';
        e.currentTarget.style.textDecoration = 'line-through';
        skillList[i].noname = true;
        chatList[j].noname  = true;
      }
      updateChat(chatList);
    };
    skillList.push(dic);
  });
  return skillList;
}

/**
 * チャパレテーブル用のリストを作成する関数
 * @param {Array} skillList skillList
 * @returns {Array} ChatList
 */
function makeChatList(skillList) {
  let chatList = [];

  // 差分
  if (diffElement.value && addDiffCheckbox.checked) {
    diffElement.value.split('\n').filter(e=>e).forEach(e => {chatList.push({type:'line', name:'', value:e})});
    chatList.push({type:'line', name:'', value:'==========='});
  }

  // 正気度ロール
  if(statsTable.children[2].lastElementChild.innerText) {
    let dic = {type:'elseRoll', name:'正気度ロール', value:'1d100<={SAN}'};
    if (statsTable.children[2].firstElementChild.firstElementChild.checked)  dic.checked=true;
    chatList.push(dic);
  }

  // アイデア・幸運・知識
  for (let row of Array.from(elseTable.children)) {
    let value = row.lastElementChild.innerText;
    if(value) chatList.push({type:'roll', name:row.firstElementChild.innerText, value:value});
  }
  if (!coc6th) {
    let i = chatList.findIndex(e => e.name=='幸運');
    if (i>-1)  chatList[i].value='{幸運}';
  }

  // 技能・判定
  chatList = chatList.concat(skillList);

  // 倍数ロール
  if (Array.from(paramsTable.children).slice(0,8).filter(e => e.lastElementChild.innerText).length>0) {
    chatList.push({type:'line', name:'', value:'==========='});
  }
  for (let row of Array.from(paramsTable.children).slice(0,8)) {
    let key = row.children[1].innerText;
    let value = row.lastElementChild.innerText;
    if(value) {
      let dic = {type:'roll', name:`${key}${coc6th?'*5':''}`, value:`{${key}}${coc6th?'*5':''}`};
      if(row.firstElementChild.firstElementChild.checked) dic.checked=true;
      chatList.push(dic);
    }
  }
  console.log(chatList);
  return chatList;
}

/**
 * チャパレテーブルを再作成する関数
 * @param {Array} chatList
 * @returns None
 */
function remakeChat(skillList) {
  chatTable.innerHTML = '';
  
  const dice  = diceElements.filter( e => e.checked)[0].value;
  const dice2 = dice2Elements.filter(e => e.checked)[0].value;
  
  const chatList = makeChatList(skillList);
  chatList.forEach(dic => {
    const row = addRow(chatTable, -1 ,true);
    const cell1 = row.children[0];
    const cell2 = row.children[1];
    const cell3 = row.children[2];

    const rCheck = document.createElement('input');
    const sCheck = document.createElement('input');
    rCheck.type = 'checkbox';
    sCheck.type = 'checkbox';
    cell1.appendChild(rCheck);
    cell2.appendChild(sCheck);

    cell2.onclick = () => {
      const text = cell3.innerText;
      cell3.innerText = text.charAt(0)=='s' ? text.substring(1,) : `s${text}`;
    }
    cell3.addEventListener('click',toggleSecretCheckbox);

    const name = !dic.noname && dic.name ? ` 【${dic.name}】` : '';
    const times = dic.times ? `x${dic.times} ` : '';

    if (dic.checked)  rCheck.checked = true;

    if (dice2=='@'&&/STR|CON|POW|DEX|APP|SIZ|INT|EDU/.test(dic.value)) {
      const key = dic.value.match(/\{(.*)\}/)[1];
      const val = parseInt(Array.from(paramsTable.children).filter(e => e.children[1].innerText==key)[0].lastElementChild.innerText);
      cell3.innerText = `${times}${dice}${name} @${val*(coc6th?5:1)}`;
      return;
    }

    if (dice2=='@'&&dic.name=='幸運'&&!coc6th) {
      const luck = elseTable.children[1].lastElementChild.innerText;
      cell3.innerText = `${times}${dice}${name} @${luck}`;
      return;
    }

    switch (dic.type) {
      case 'line':
        cell3.innerText = times + dic.value;
        break;
      case 'dice':
        cell3.innerText = times + (sDiceCheckbox.checked ? 's' : '') + dic.value + name;
        break;
      case 'choice':
        cell3.innerText = times + (sChoiceCheckbox.checked ? 's' : '') + dic.value + name;
        break;
      case 'elseRoll':
        if      (dice=='CC')  dic.value = dic.value.replace(/(CBR|RES)B/i,'$1');
        else if (dice=='CCB') dic.value = dic.value.replace(/(CBR|RES)([^B])/i,'$1B$2');
        cell3.innerText = times + (dice2=='s' ? 's' : '') + dic.value + name;
        break;
      case 'roll':
        if (dice2=='@') {
          cell3.innerText = `${times}${dice}${name} @${dic.value}`;
          break;
        }
        cell3.innerText = `${times}${dice2}${dice}<=${dic.value}${name}`;
        break;
    }
  });
  return chatList;
}

/**
 * チャパレテーブルの表記だけ更新する関数
 * @param {Array} chatList 
 */
function updateChat(chatList) {
  const dice  = diceElements.filter( e => e.checked)[0].value;
  const dice2 = dice2Elements.filter(e => e.checked)[0].value;

  for (let i=0; i<chatList.length; i++ ) {
    const dic = chatList[i];
    const name = !dic.noname && dic.name ? ` 【${dic.name}】` : '';
    const times = dic.times ? `x${dic.times} ` : '';
    const secret = chatTable.children[i].children[1].firstElementChild.checked;
    const cell3  = chatTable.children[i].lastElementChild;

    if (dice2=='@'&&/STR|CON|POW|DEX|APP|SIZ|INT|EDU/.test(dic.value)) {
      let key = dic.value.match(/\{(.*)\}/)[1];
      let val = parseInt(Array.from(paramsTable.children).filter(e => e.children[1].innerText==key)[0].lastElementChild.innerText);
      cell3.innerText = `${times}${secret ? 's' : ''}${dice}${name} @${val*(coc6th?5:1)}`;
      continue;
    }

    if (dice2=='@'&&dic.name=='幸運'&&!coc6th) {
      let luck = elseTable.children[1].lastElementChild.innerText;
      cell3.innerText = `${times}${secret ? 's' : ''}${dice}${name} @${luck}`;
      continue;
    }

    switch (dic.type) {
      case 'line':
        cell3.innerText = times + dic.value;
        break;
      case 'dice':
        cell3.innerText = times + (xor(sDiceCheckbox.checked,secret) ? 's' : '') + dic.value + name;
        break;
      case 'choice':
        cell3.innerText = times + (xor(sChoiceCheckbox.checked,secret) ? 's' : '') + dic.value + name;
        break;
      case 'elseRoll':
        if      (dice=='CC')  dic.value = dic.value.replace(/(CBR|RES)B/i,'$1');
        else if (dice=='CCB') dic.value = dic.value.replace(/(CBR|RES)([^B])/i,'$1B$2');
        cell3.innerText = times + (xor(dice2=='s',secret) ? 's' : '') + dic.value + name;
        break;
      case 'roll':
        if (dice2=='@')  cell3.innerText = `${times}${secret ? 's' : ''}${dice}${name} @${dic.value}`;
        else  cell3.innerText = `${times}${xor(dice2=='s',secret) ? 's' : ''}${dice}<=${dic.value}${name}`;
        break;
    }
  }
}

function getChatpalette() {
  return [...chatTable.children].filter((e) => !e.firstElementChild.firstElementChild.checked).map((e) => e.lastElementChild.innerText).join('\n');
}

function exportUnit(event) {
  let unit = jsonTemplate = { kind: 'character',
    data: {
      name: memoElement.value.split('\n')[0] ,
      initiative: parseInt(paramsTable.children[3].lastElementChild.innerText) || 0,
      width: parseInt(unitSizeElement.value),
      color: colorElement.value,
      memo:  '',
      commands: getChatpalette(),
      params: [],
      status: [],
      faces:  [],
      secret:     document.getElementById('secret').checked,
      invisible:  document.getElementById('invisible').checked,
      hideStatus: document.getElementById('hideStatus').checked
    }
  };

  // memo
  if (memoElement.value.trim().split('\n').length>1) {
    unit.data.memo = memoElement.value.trim().replace(/^.+\n/,'').trim();
  }
  
  // params
  [...paramsTable.children].filter((e)=>!e.firstElementChild.firstElementChild.checked).forEach((row)=>{
    if (row.lastElementChild.innerText) {
      unit.data.params.push({label:row.children[1].innerText, value:row.lastElementChild.innerText});
    }
  });
  for (let row of addParamsTable.children) {
    const label = row.firstElementChild.innerText;
    const val   = row.lastElementChild.innerText;
    if (label || val)  unit.data.params.push({label:label, value:val});
  };

  // stats
  [...statsTable.children].filter((e)=>!e.firstElementChild.firstElementChild.checked).forEach((row)=>{
    const val = parseInt(row.lastElementChild.innerText);
    if (val)  unit.data.status.push({label:row.children[1].innerText, value:val, max:val});
  });
  if (!coc6th) {
    let luck = parseInt(elseTable.children[1].lastElementChild.innerText);
    if (luck)  unit.data.status.push({label:'幸運', value:luck, max:luck});
  }
  for (let row of addStatsTable.children) {
    const label  = row.firstElementChild.innerText;
    const val    = parseInt(row.children[1].innerText);
    const maxVal = parseInt(row.lastElementChild.innerText);
    if (label || val) {
      unit.data.status.push( maxVal ? {label:label, value:val, max:maxVal} : {label:label, value:val} );
    }
  };

  // faces
  if (diffElement.value)  diffElement.value.split('\n').forEach(row => unit.data.faces.push({iconUrl:null, label:row}));

  if (importedUnit) {
    // externalURL
    if (importedUnit.data.externalUrl)  unit.data.externalUrl = importedUnit.data.externalUrl;
    // icon, face-icon
    if (importedUnit.data.iconUrl)  unit.data.iconUrl = importedUnit.data.iconUrl;
    if (importedUnit.data.faces) {
      importedUnit.data.faces.forEach(face => {
        const i = unit.data.faces.findIndex(e => e.label==face.label);
        if(i>-1) unit.data.faces[i].iconUrl = face.iconUrl;
      });
    }
  }
  console.log(unit);
  copy2clipboard(event.currentTarget, JSON.stringify(unit));
}

function copy2clipboard(element, text) {
  const defText = element.innerText;
	navigator.clipboard.writeText(text);
	element.innerText = 'Copied!';
	setTimeout(() => element.innerText = defText, 1000);
}
