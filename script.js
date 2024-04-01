"use strict"

function get_id(target) { return document.getElementById(target) };
function get_css(target) { return document.querySelector(target) };


var data = fetch("https://mtgjson.com/api/v5/AtomicCards.json")
  .then(function(e) { return e.json() })
  .then(function(e) { return e.data })

var rules = { by_id: {}, ordered: [] };

async function parse_rules() {
  let raw = await fetch("./rules.txt")
    .then(function(e) { return e.text() })
  raw = raw.replaceAll("\r", "\n");
  let lines = raw.split("\n").filter(e => e !== "");
  let start_of_toc = lines.indexOf("Contents");
  let start_of_rules = lines.indexOf("1. Game Concepts", start_of_toc + 3);
  let start_of_glossary = lines.indexOf("Glossary", start_of_rules);
  let start_of_credits = lines.indexOf("Credits", start_of_rules);
  console.log(start_of_toc,start_of_rules,start_of_glossary,start_of_credits);
  build_preamble(lines.slice(0, start_of_toc));
  build_toc(lines.slice(start_of_toc, start_of_rules));
  build_rules(lines.slice(start_of_rules, start_of_glossary));
  let container = document.createElement("div");
  container.classList.add("rules-data");
  rules.ordered.map((e) => container.appendChild(e));
  return container;
}

function build_preamble(entries) {
  let container = document.createElement("div");
  container.classList.add("container-preamble");
  rules.ordered.push(container);
  for (let index in entries) {
    let entry = entries[index];
    let element = document.createElement("div");
    element.classList.add("line-preamble");
    element.innerHTML = entry;
    element.id = "preamble-" + index;
    container.appendChild(element);
  }
}

function get_line_id(line) {
  let id = line.match(/^[0-9\.a-z]+/);
  if (!id) {
    id = line.toLowerCase() + "-tag";
  } else { 
    id = id[0];
  }
  return id;
}

function build_toc(entries) {
  let container = document.createElement("div");
  container.classList.add("container-toc");
  container.id = "contents-tag";
  rules.ordered.push(container);
  for (let entry of entries) {
    let id = get_line_id(entry);
    let level = get_rule_level(id);
    let element = document.createElement("div");
    element.classList.add("line-toc");
    element.classList.add("toc-level-" + level);
    let link = document.createElement('a');
    link.setAttribute('href', "#" + id);
    link.innerHTML = entry;
    element.appendChild(link);
    container.appendChild(element);
  }
}

function get_rule_level(id) {
  if (id.at(-1) == ".") {
    id = id.slice(0, -2);
  }
  let level = (id.match(/[\.a-z]/g) || []).length;
  if (id.length >= 2) {
    level += 1;
  }
  return level;
}

function build_rules(entries) {
  let container = document.createElement("div");
  container.classList.add("container-rules");
  rules.ordered.push(container);
  for (let entry of entries) {
    if (entry.startsWith("Example")) {
      let rule_div = document.createElement('div');
      rule_div.classList.add("line-rule");
      let element = document.createElement('div');
      element.classList.add("example");
      rule_div.appendChild(element);
      element.innerHTML = entry;
      container.appendChild(rule_div);
      continue;
    }

    let id = get_line_id(entry);
    let tag = document.createElement('div');
    tag.classList.add("rule-id");
    tag.innerHTML = id;
    let rule_div = document.createElement('div');
    rule_div.classList.add("line-rule");
    let level = get_rule_level(id);
    rule_div.classList.add("rule-level-" + level);
    rule_div.id = id;
    let rule_text = document.createElement('div');
    rule_text.classList.add("rule-text");
    rule_text.innerHTML = entry.slice(id.length + 1);
    rule_div.appendChild(tag);
    rule_div.appendChild(rule_text);
    let object = {
      id: id,
      html: rule_div
    }
    rules.by_id[object.id] = object;
    container.appendChild(rule_div);
  }
}

async function load_page(event) {
  get_id("rules-container").appendChild(await parse_rules());
}

window.onload = load_page;

console.log(data);
