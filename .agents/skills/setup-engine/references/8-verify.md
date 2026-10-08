# Verify engine reference

Read the explicit engine reference in AGENTS.md. Confirm the file exists and
agrees with project.yaml's engine/version. Codex does not expand @path imports.
Run `bash .codex/scripts/project-coherence.sh` and inspect its observations;
NOT CHECKED is not a pass. See codex-runtime.md for runtime differences.
