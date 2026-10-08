#!/usr/bin/env python3
"""Validate portable studio metadata and explicit runtime helpers (Python 3.11+)."""
import json
import re
import subprocess
import tempfile
import tomllib
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]

def check(condition, message):
    if not condition:
        raise ValueError(message)

def validate(root=ROOT):
    agents = sorted((root / '.codex/agents').glob('*.toml'))
    skills = sorted((root / '.agents/skills').glob('*/SKILL.md'))
    check(len(agents) == 50, f'Expected 50 roles, found {len(agents)}')
    check(len(skills) == 77, f'Expected 77 skills, found {len(skills)}')
    role_names = set()
    for path in agents:
        data = tomllib.loads(path.read_text())
        for key in ('name', 'description', 'developer_instructions'):
            check(isinstance(data.get(key), str) and data[key].strip(), f'{path}: missing {key}')
        check(data['name'] == path.stem, f'{path}: role/filename mismatch')
        check(data['name'] not in role_names, f'{path}: duplicate role')
        role_names.add(data['name'])
        check('model' not in data, f'{path}: expected inherited model')
    skill_names = set()
    for path in skills:
        text = path.read_text()
        check(text.startswith('---\n'), f'{path}: missing frontmatter')
        front = text.split('---', 2)[1]
        fields = {}
        for line in front.strip().splitlines():
            key, value = line.split(':', 1)
            fields[key] = value.strip()
        check(set(fields) == {'name', 'description'}, f'{path}: nonportable metadata')
        check(fields['name'] == path.parent.name, f'{path}: skill/dirname mismatch')
        check(fields['description'].strip('"\''), f'{path}: empty description')
        if fields['description'].startswith('"'):
            check(isinstance(json.loads(fields['description']), str), f'{path}: invalid quoted description')
        check(fields['name'] not in skill_names, f'{path}: duplicate skill')
        skill_names.add(fields['name'])
    check('```' not in (root / '.gitignore').read_text(), 'Markdown must not leak into .gitignore')
    config = tomllib.loads((root / '.codex/config.toml').read_text())
    check(config['agents']['max_concurrent_threads_per_session'] == 3, 'Unexpected concurrency cap')
    catalog = (root / 'Studio Skill Testing Framework/catalog.yaml').read_text()
    skill_catalog, role_catalog = catalog.split('\nagents:', 1)
    for names, section in ((skill_names, skill_catalog), (role_names, role_catalog)):
        listed = re.findall(r'^  - name: (.+)$', section, re.M)
        check(set(listed) == names and len(listed) == len(names), 'Catalog coverage or duplicates')
    for spec in re.findall(r'^    spec: (.+)$', catalog, re.M):
        if spec.strip() in ('""', "''"): continue
        check((root / spec).is_file(), f'Missing catalog spec: {spec}')
    for base in (root / '.agents', root / '.codex/agents'):
        for path in base.rglob('*'):
            if path.suffix not in ('.md', '.toml'): continue
            text = path.read_text()
            for token in ('.claude/', 'CLAUDE_SKILL_DIR', 'CLAUDE_PROJECT_DIR', '!`'):
                check(token not in text, f'{path}: unported {token}')
            check(not re.search(r'^@\S+', text, re.M), f'{path}: implicit import')
            for match in re.findall(r'\.codex/agents/([\w-]+)\.toml', text):
                check(match in role_names, f'{path}: missing role {match}')
    for path in (root / '.codex/scripts').glob('*.sh'):
        subprocess.run(['bash', '-n', str(path)], check=True, capture_output=True, text=True)
    # Markdown hyperlinks refer to existing files; code examples may name future game artifacts.
    for path in root.rglob('*.md'):
        if '.git' in path.parts: continue
        for link in re.findall(r'\]\(([^\n)]+)\)', path.read_text()):
            target = link.strip().split(' "', 1)[0].strip('<>').split('#', 1)[0]
            if not target or re.match(r'[a-zA-Z][\w+.-]*:', target): continue
            if any(marker in target for marker in ('*', '[', '<', '$', '{')): continue
            check((path.parent / unquote(target)).exists(), f'{path.relative_to(root)}: broken link {target}')
    for path in (root / 'examples/wechat-minigame').glob('*.json'):
        json.loads(path.read_text())
    project = json.loads((root / 'examples/wechat-minigame/project.config.json').read_text())
    check(project['compileType'] == 'game', 'Starter must be a mini game')
    check((root / 'examples/wechat-minigame/game.js').is_file(), 'Missing native entry')
    helper = str(root / '.codex/scripts/yaml-helper.sh')
    with tempfile.TemporaryDirectory(prefix='studio-check-') as temp:
        fixture = Path(temp)
        for rigor in ('minimal', 'standard', 'full'):
            (fixture / 'project.yaml').write_text(f'schema_version: 1\nmodes:\n  rigor: {rigor}\n')
            output = subprocess.run(['bash', helper, 'resolve_config', '--keys', 'workflow,review_mode'], cwd=temp, check=True, capture_output=True, text=True)
            check(not output.stderr, f'Config helper stderr: {output.stderr}')
            check(f'workflow: {rigor}' in output.stdout, f'Rigor resolution: {output.stdout}')
        (fixture / 'project.local.yaml').write_text('modes:\n  review_mode: solo\n')
        output = subprocess.run(['bash', helper, 'resolve_config', '--keys', 'review_mode'], cwd=temp, check=True, capture_output=True, text=True)
        check('review_mode: solo (project.local.yaml)' in output.stdout, f'Local override: {output.stdout}')
        (fixture / 'project.local.yaml').unlink()
        for engine, expected in [('Godot', 'src'), ('Unity', 'Assets'), ('Unreal', 'Source'), ('WeChat', 'src'), ('Cocos', 'assets'), ('LayaAir', 'src')]:
            (fixture / 'project.yaml').write_text(f'engine:\n  name: {engine}\n')
            script = 'source "$1"; validate_yaml_enum project.yaml; resolve_code_root'
            output = subprocess.run(['bash', '-c', script, 'studio-check', helper], cwd=temp, check=True, capture_output=True, text=True)
            check(not output.stderr and output.stdout.startswith(expected + '\t'), f'Code-root resolution for {engine}: {output}')
        (fixture / 'project.yaml').write_text('engine:\n  name: WeChat\nplatforms:\n  wechat:\n    game_root: minigame\n')
        output = subprocess.run(['bash', '-c', 'source "$1"; resolve_code_root', 'studio-check', helper], cwd=temp, check=True, capture_output=True, text=True)
        check(output.stdout.startswith('minigame\t'), f'Nested native game root: {output.stdout}')
    return len(agents), len(skills)

if __name__ == '__main__':
    try:
        agents, skills = validate()
    except (ValueError, OSError, subprocess.CalledProcessError, tomllib.TOMLDecodeError) as error:
        raise SystemExit(f'FAIL: {error}')
    print(f'PASS: {agents} roles, {skills} skills, catalog, links, shell syntax, JSON and config helper smoke checks')
    print('NOT ASSESSED: model behavior, WeChat DevTools, real devices, backend/ads and platform publication')
