# Tab Completion for tog
> Thanks to grunt & gulp team

To enable tog aliases auto-completion in shell you should add `eval "$(tog completion shell)"` in your `.shellrc` file.

## Bash

Add `eval "$(tog completion bash)"` to `~/.bashrc`.

## Zsh

Add `eval "$(tog completion zsh)"` to `~/.zshrc`.

## Powershell

Add `Invoke-Expression ((tog completion powershell) -join [System.Environment]::NewLine)` to `$PROFILE`.

## Fish

Add `tog completion fish | source` to `~/.config/fish/config.fish`.
