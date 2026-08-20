# Step default output device volume up/down via Core Audio (no VK_VOLUME_* keys).
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet("up", "down")]
    [string]$Direction
)

$ErrorActionPreference = "Stop"

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;

namespace HkaVolume {
  [ComImport]
  [Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")]
  public class MMDeviceEnumeratorComObject { }

  [Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IMMDeviceEnumerator {
    int NotImpl();
    int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice);
  }

  [Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IMMDevice {
    int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface);
    int OpenPropertyStore(int stgmAccess, out IntPtr ppProperties);
    int GetId(out IntPtr ppstrId);
    int GetState(out uint pdwState);
    int RegisterPropertyChangeNotificationEvent(IntPtr hEvent, out IntPtr pdwReserved);
    int UnregisterPropertyChangeNotificationEvent(IntPtr hEvent);
  }

  [Guid("5CDF2C82-841E-4CB6-8862-9C077755D7A7"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
  public interface IAudioEndpointVolume {
    int f(); int g(); int h(); int i();
    int SetMasterVolumeLevelScalar(float fLevel, ref Guid pguidEventContext);
    int j();
    int GetMasterVolumeLevelScalar(out float pfLevel);
    int k(); int l(); int m(); int n();
    int SetMute([MarshalAs(UnmanagedType.Bool)] bool bMute, ref Guid pguidEventContext);
    int GetMute(out bool pbMute);
  }

  public static class Volume {
    const float Step = 0.05f;
    // Private context GUID — avoids broadcasting to system volume OSD / a11y listeners.
    static readonly Guid EventContext = new Guid("a1b2c3d4-e5f6-7890-abcd-ef1234567890");

    static IAudioEndpointVolume GetEndpointVolume() {
      var enumerator = (IMMDeviceEnumerator)new MMDeviceEnumeratorComObject();
      IMMDevice device;
      Marshal.ThrowExceptionForHR(enumerator.GetDefaultAudioEndpoint(0, 1, out device));
      Guid iid = typeof(IAudioEndpointVolume).GUID;
      object obj;
      Marshal.ThrowExceptionForHR(device.Activate(ref iid, 23, IntPtr.Zero, out obj));
      return (IAudioEndpointVolume)obj;
    }

    public static int Step(string direction) {
      var vol = GetEndpointVolume();
      float level;
      Marshal.ThrowExceptionForHR(vol.GetMasterVolumeLevelScalar(out level));
      float delta = direction == "up" ? Step : -Step;
      float next = Math.Max(0f, Math.Min(1f, level + delta));
      Guid ctx = EventContext;
      Marshal.ThrowExceptionForHR(vol.SetMasterVolumeLevelScalar(next, ref ctx));
      return (int)Math.Round(next * 100);
    }
  }
}
'@

try {
  $pct = [HkaVolume.Volume]::Step($Direction)
  Write-Output $pct
  exit 0
}
catch {
  [Console]::Error.WriteLine($_.Exception.Message)
  exit 1
}
