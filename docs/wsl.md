# Windows and WSL setup

## Native Windows GUI

Install NeuroLink in Windows or WSL as an external tool. Leave the WSL
distribution field empty to execute `neurolink` directly in Windows.

Set `NEUROLINK_EXECUTABLE` to an explicit executable path if NeuroLink is not
on `PATH`.

## WSL execution

Select a WSL distribution name in the GUI, such as `Ubuntu`. The GUI will
invoke `wsl.exe -d <distribution> -- neurolink ...` and stream the result back
to the native Windows interface.

Install NeuroLink inside the selected distribution:

```bash
npm install -g @juspay/neurolink
neurolink --help
```

## WSLg Linux desktop

Run the Linux build in WSLg. NeuroLink is executed directly inside the Linux
environment, and file paths are resolved by Linux rather than Windows.

Linux package managers and desktop integrations vary by distribution. Package
the GUI as an AppImage, DEB, or RPM through the Tauri bundle configuration.
