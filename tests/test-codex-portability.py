#!/usr/bin/env python3
"""Run the README copy route in an isolated HOME; check static skill contracts.

This is not an assistant-discovery, provider, writing-quality or visual acceptance test.
"""
from pathlib import Path
import os
import json
import select
import sys
import time
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
readme = (ROOT / 'README.md').read_text()
block = readme.split('<!-- CODEX-COPY:START -->')[1].split('<!-- CODEX-COPY:END -->')[0]
command = re.search(r'```bash\n(.*?)\n```', block, re.S).group(1)
skills = sorted((ROOT / 'skills').glob('*/SKILL.md'))
assert len(skills) == 18

with tempfile.TemporaryDirectory(prefix='public-skills-') as temporary:
    project = Path(temporary) / 'client project'
    project.mkdir()
    home = Path(temporary) / 'empty-home'
    home.mkdir()
    source = project / 'social-media-skills' / 'skills'
    shutil.copytree(ROOT / 'skills', source)
    env = {'HOME': str(home), 'PATH': '/usr/bin:/bin', 'LC_ALL': 'C'}

    def install(check=True):
        return subprocess.run(['/bin/bash', '-c', command], cwd=project,
                              env=env, capture_output=True, text=True, check=check)

    install()
    installed = project / '.agents' / 'skills'
    assert len(list(installed.glob('*/SKILL.md'))) == 18
    for original in (ROOT / 'skills').rglob('*'):
        if original.is_file():
            assert (installed / original.relative_to(ROOT / 'skills')).read_bytes() == original.read_bytes()
    assert not list(home.iterdir()), 'The copy route must not write global configuration'

    if '--codex' in sys.argv:
        binary = shutil.which('codex')
        assert binary, '--codex requires the installed Codex CLI'
        runtime_home = home / '.codex'
        runtime_home.mkdir()
        runtime_env = dict(env, CODEX_HOME=str(runtime_home))
        node = shutil.which('node')
        if node:
            runtime_env['PATH'] = str(Path(node).parent) + ':' + env['PATH']
        server = subprocess.Popen([binary, 'app-server', '--stdio'], cwd=project,
                                  env=runtime_env, stdin=subprocess.PIPE,
                                  stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        try:
            def request(message, response_id=None):
                server.stdin.write((json.dumps(message) + '\n').encode())
                server.stdin.flush()
                if response_id is None:
                    return
                buffer = b''
                deadline = time.monotonic() + 30
                while time.monotonic() < deadline:
                    if not select.select([server.stdout], [], [], 1)[0]:
                        continue
                    chunk = os.read(server.stdout.fileno(), 65536)
                    assert chunk, 'Codex app-server exited before responding'
                    buffer += chunk
                    while b'\n' in buffer:
                        line, buffer = buffer.split(b'\n', 1)
                        response = json.loads(line)
                        if response.get('id') == response_id:
                            assert 'error' not in response, response
                            return response['result']
                raise AssertionError('Codex app-server response timed out')
            request({'id': 1, 'method': 'initialize', 'params': {
                'clientInfo': {'name': 'public_skills_check', 'version': '1.0'}}}, 1)
            request({'method': 'initialized', 'params': {}})
            result = request({'id': 2, 'method': 'skills/list', 'params': {
                'cwds': [str(project)], 'forceReload': True}}, 2)
            entry = result['data'][0]
            assert not entry['errors'], entry['errors']
            repo_skills = [item for item in entry['skills'] if item['scope'] == 'repo']
            assert {item['name'] for item in repo_skills} == {item.parent.name for item in skills}
            assert all(Path(item['path']).resolve().parent.parent == installed.resolve() for item in repo_skills)
            assert all(item['scope'] in ('repo', 'system') for item in entry['skills'])
            assert all(str(Path(item['path']).resolve()).startswith(str(Path(temporary).resolve()) + os.sep)
                       for item in entry['skills']), 'Inherited skills outside isolated project/HOME'
            print('PASS: live Codex discovery of all 18 project skills; empty account/config HOME; no inherited user skills')
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()

    # Consecutive source updates preserve customised copies, unrelated files and links.
    voice = installed / 'voice-builder' / 'SKILL.md'
    voice.write_text('CLIENT VOICE CUSTOMISATION\n')
    (source / 'voice-builder' / 'SKILL.md').write_text('UPSTREAM RELEASE TWO\n')
    unrelated = installed / 'client-only'
    unrelated.mkdir()
    (unrelated / 'SKILL.md').write_text('CLIENT SKILL\n')
    shutil.rmtree(installed / 'post-writer')
    (installed / 'post-writer').symlink_to(project / 'missing-custom-source', target_is_directory=True)
    second = install()
    assert voice.read_text() == 'CLIENT VOICE CUSTOMISATION\n'
    assert (unrelated / 'SKILL.md').read_text() == 'CLIENT SKILL\n'
    assert (installed / 'post-writer').is_symlink()
    assert not (project / 'missing-custom-source').exists()
    assert 'Preserved existing skill:' in second.stdout
    (source / 'voice-builder' / 'SKILL.md').write_text('UPSTREAM RELEASE THREE\n')
    install()
    assert voice.read_text() == 'CLIENT VOICE CUSTOMISATION\n'
    shutil.rmtree(source)
    missing = install(check=False)
    assert missing.returncode != 0 and 'Missing source skills folder' in missing.stdout

for path in skills:
    text = path.read_text()
    assert '## Codex and Claude runtime' in text, path
    assert 'or ask in chat' in text, path
    assert 'starter defaults' in text and 'Do not write persistent learnings unless requested' in text, path
    assert 'profile refresh' in text and 'in place, preserving unrelated user facts and rules' in text, path
    assert 'Consumers must reread those canonical files' in text, path
    assert 'new deliverables that would collide with unrelated existing files' in text, path
    assert '~/Desktop/' not in text and '/Users/' not in text, path
    for ref in re.findall(r'`(references/[^`]+\.md)`', text):
        assert (path.parent / ref).is_file(), (path, ref)

for name in ['gemini-carousel', 'gemini-infographic', 'graphic-designer', 'pinned-comment',
             'profile-optimizer', 'quote-post', 'youtube-thumbnail']:
    text = (ROOT / 'skills' / name / 'SKILL.md').read_text()
    assert '**prompt-ready**' in text and 'inspect each export' in text, name
for name in ['niche-research', 'post-scorer', 'reels-scripting']:
    text = (ROOT / 'skills' / name / 'SKILL.md').read_text()
    assert 'Never scrape comments' in text, name
scorer = (ROOT / 'skills/post-scorer/SKILL.md').read_text()
assert 'Fallback benchmarks' not in scorer and 'Charlie Hills data' not in scorer
assert 'render pending' in (ROOT / 'skills/graphic-designer/SKILL.md').read_text()
print('PASS: 18 project-local copies and bundled references; clean HOME; consecutive-copy preservation; missing source failure; portable instruction contracts')
print('NOT TESTED: provider access, generated content quality, visual acceptance, client activation')
if '--codex' not in sys.argv:
    print('NOT TESTED: live assistant discovery (run with --codex on macOS/Linux)')
