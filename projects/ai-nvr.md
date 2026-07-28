# Building a Self-Hosted AI NVR on Necropolis

> A build series. I'm turning an old gaming rig (RTX 3060, 12GB VRAM) into a Proxmox node that runs my own network video recorder with **local** AI object detection — no cloud, no subscription, footage stays in my house. Documented stage by stage, including what breaks.

**The hardware I'm starting with:**
- Old gaming rig — RTX 3060 (12GB VRAM), destined to become a new node in my Necropolis Proxmox cluster
- Tapo C210 cameras (cheap, RTSP-capable)
- ~~An 8TB drive shucked from an Xbox external enclosure~~ — turned out to be a dying enterprise helium drive (see Stage 1); replacing it with a healthy CMR drive for footage

**The goal:** Proxmox on the rig → into the cluster → NVR stack (Frigate) → local model on the 3060 analyzing the camera feeds.

---

## Build log

### Stage 1 — Can I even trust this drive?
*Status: ✅ done — answer was no, and SMART caught it*

Every NVR build starts with a storage question, and mine started with a hand-me-down. A friend was throwing out an old Xbox external drive. I asked for it, cracked the plastic shell open, and found a full **8TB hard drive** inside — the kind of "shuck" that pays for a whole build. But before 8TB of security footage lives on a drive I got for free, it has to earn my trust.

**First contact.** I dropped it into a SATA drive dock on my Windows desktop and it spun up immediately — good sign, no dead-on-arrival drama.

**The first problem: Windows only saw 2TB.** Disk Management showed the rest — about **5.4TB unallocated** — just sitting there, and it wouldn't let me create a volume on it. A bit of reading pointed at the likely culprit: **MBR partition tables hard-cap at ~2.2TB**, and GPT is the fix. I made a note to convert it *if* I decided to keep the drive — but I didn't bother yet. No point partitioning a free hand-me-down before I knew it was even healthy. Check first, invest later.

**The real test: SMART.** A free drive is only a deal if it's healthy — which is exactly why I didn't waste time on the partition table first. SMART operates at the drive-firmware level, independent of how the disk is partitioned, so the capacity ceiling was irrelevant to the only question that mattered. I installed smartmontools and pulled the full report with `smartctl -a -d sat /dev/sdc` (the `-d sat` flag is what makes SMART pass through the USB dock's bridge chip).

The drive turned out to be an **HGST Ultrastar He8 (HUH728080ALE604)** — an enterprise, helium-sealed, CMR drive. On paper, *ideal* for an NVR: CMR handles continuous writes, and enterprise drives are built for 24/7. In reality:

- **Model:** HGST Ultrastar He8 HUH728080ALE604 (enterprise, helium-filled, CMR)
- **Power-on hours:** **72,989 — about 8.3 years** of runtime
- **Overall SMART health:** **FAILED** — *"Drive failure expected in less than 24 hours. SAVE ALL DATA."*
- **Helium level:** attribute value **1** vs a threshold of 25 — **FAILING_NOW**. The hermetic seal has leaked; a He8 without its helium is unrecoverable.
- **Reallocated sectors:** 1090 · **Pending sectors:** 88 · **Offline uncorrectable:** 3 (healthy = 0)
- **ATA error count:** 433, with recent uncorrectable read errors

**Verdict: DEAD. Do not use.** SMART caught a drive hours from failure *before* a single recording ever touched it. The whole point of Stage 1 was to answer "can I trust this drive?" — the answer was no, and finding that out cost me twenty minutes instead of an entire lost archive.

**The lesson (the reason this stage exists):** *always run a SMART health check on any second-hand or hand-me-down drive before you trust it — especially a "free" one.* The three attributes that matter most: overall health self-assessment, `Reallocated_Sector_Ct`, and `Current_Pending_Sector` (plus `Helium_Level` on sealed drives). A free 8TB drive that fails tomorrow isn't a deal — it's a disaster you haven't had yet.

**Impact on the build:** I need a different drive for footage. That does *not* block the build — Stages 2–3 (Proxmox node + GPU passthrough) run on the rig's existing storage; the NVR array just needs a healthy **CMR** drive before Stage 4.

#### Incoming inspection: a stack of 5 free WD Greens

I had a stack of hand-me-down WD Green drives (3× 3TB, 2× 2TB) to test. I checked SMART on all five and ranked them on the attributes that actually matter for an NVR — not just the overall PASS/FAIL, but the raw values:

| Drive | Load_Cycle | Reallocated | Pending | Uncorrectable | Multi-Zone | Verdict |
|-------|-----------:|------------:|--------:|--------------:|-----------:|---------|
| 3TB Disk 1 | 689,855 | 0 | **0** | **0** | **0** | ✅ clean media, worn park mechanism |
| 3TB Disk 2 | 51,490 | 0 | 95 | 33 | 54 | ❌ low cycles but shedding sectors |
| 3TB Disk 3 | 633,517 | 0 | **0** | **0** | **0** | ✅ clean media, worn park mechanism |
| 2TB Disk 4 | 589,581 | 0 | 1,421 | 558 | 72,039 | ❌ failing |
| 2TB Disk 5 | 351,489 | 6 | 1,398 | 0* | 117,485 | ❌ failing |

> A note on labels: I numbered these by testing order (Disk 1–5), which I'd do differently now — two of the 3TB drives (Disk 1 and Disk 3) are near-identical WD30EZRX units, almost certainly raided together in a past life, and telling them apart by a notebook number is a mix-up waiting to happen. The right move is to tag each drive physically by its **serial number** (printed on the drive's own label), because that ID is permanent and survives being unplugged and re-docked. The winner here is serial **WD-WCAWZ1553614**.

**The lesson that runs through this whole stage:** a drive's overall SMART status can say `PASSED` while it's quietly losing sectors — because sector-health attributes are *Old_age* type with a threshold of 0, so they never trip the overall FAIL. You have to read the raw values. And the two failure modes are not equal:

- **Load_Cycle_Count** wears the *mechanism* (head parking). High is bad, but it's survivable — an NVR rarely idles, and `idle3ctl -d` disables the aggressive parking entirely.
- **Pending / Offline_Uncorrectable / Multi_Zone_Error_Rate** mean the *media itself* is failing. That's your footage, gone. Non-negotiable disqualifier.

By that logic the "low load cycle" drive (Disk 2) was a trap. Two drives came through with flawless media — **Disk 1 and Disk 3** — and the only knock on either is a worn park mechanism I can mitigate with `idle3ctl -d`. I picked **Disk 3** to test first, on the tiebreaker: slightly *lower* load cycles (633k vs Disk 1's 689k). It goes to the real test — a full `smartctl -t long` surface scan — with Disk 1 held as the backup.

*Takeaway: with second-hand drives, inspect the whole batch, rank by media-health attributes first and load cycles only as a tiebreaker, and expect most of a free stack to be junk — 3 of these 5 were shedding sectors outright, and as it turns out, only 1 of the 5 survived all the way to the end.*

#### The surface scan calls Disk 3's bluff
*Status: ⚠️ inconclusive — failed the first long test, and the verification re-run got cut short*

Clean attributes bought Disk 3 the pole position. The long test took it away. `smartctl -t long` reads *every* sector, and mine stopped about 10% in:

```
# 1  Extended offline    Completed: read failure    90% left    LBA 13793176
```

The drive hit a sector near the front of the platter it physically could not read — and here's the part that matters: `Reallocated_Sector_Ct`, `Current_Pending_Sector`, and `Offline_Uncorrectable` were *all still 0*. The attribute snapshot had no idea anything was wrong. Only actively reading the surface exposed the dead sector; the drive's self-reported résumé stayed spotless. (`Multi_Zone_Error_Rate` ticked from 0 to 1 — the one faint tell.)

**So the deeper lesson: the SMART attribute snapshot is the drive's résumé; the long test is the interview.** Disk 3 had a flawless résumé and still couldn't read its own platter. A footage drive has to pass the interview, not just look good on paper.

**Ruling out a fluke.** A single read failure *can* be a soft error, so before condemning the drive I tried to force the issue. From Windows I ran `diskpart`'s `clean all` — a full zero-write across every sector, which forces the drive to either write each marginal sector cleanly or reallocate it. Then I kicked off a second long test to see whether the surface came back clean.

**And Windows Update ate the test.** The machine rebooted itself for an update partway through and killed the run — it never finished. Which is its own homelab lesson: **don't run multi-hour drive tests on a machine that reboots on someone else's schedule.** These belong on a Linux live USB or the Proxmox host itself, where the only thing that reboots the box is me.

*Status: Disk 3 is on hold — a completed long test *after* the zero-write is the only thing that clears or condemns it, and that's what I'll run next on a machine I control. Until it passes end-to-end, Disk 3 stays out of the footage array.*

#### Disk 1 passes the interview — we have a drive
*Status: ✅ done — 3TB Disk 1 completed the extended test clean; it's the footage drive*

With Disk 3 benched, I fell back to **Disk 1** — the other clean-media 3TB (WD Green WD30EZRX, serial **WD-WCAWZ1553614**, 29,247 hours, 689,856 load cycles, same spotless attributes: 0 reallocated, 0 pending, 0 uncorrectable). Same clean résumé Disk 3 had. The only thing that counts is whether it survives the interview.

I ran `smartctl -t long` — the full ~7.8-hour surface read — on a connection I left alone this time. Early in the run the temperature log showed a few power/spin-down dropouts (the USB dock trying to sleep the drive mid-test); once those settled it ran uninterrupted to the end. The result:

```
# 1  Extended offline    Completed without error    00%    LBA_of_first_error: -
```

**Completed without error. Zero percent remaining — it read every sector on the platter — and no failing LBA.** This is the pass #A couldn't produce. Attributes still clean afterward, and now backed by a full surface scan that actually touched all 3TB.

**Verdict: #C is the footage drive.** Résumé clean *and* interview passed — the only bar that earns a drive a place in the array. Next it gets `idle3ctl -d` applied to disable the aggressive head-parking (that 689k load-cycle count is the one wear marker worth mitigating), then it's ready for Proxmox.

**Stage 1 closed.** The hunt started with a free 8TB drive that turned out to be hours from death and ran through a stack of five hand-me-downs, most of them junk. It ends with a proven-healthy 3TB CMR drive that cost nothing and — more importantly — one I can *prove* is healthy, because I tested it the right way. The whole point of Stage 1 was to answer "can I trust a drive with my footage?" For #C, the answer is finally yes.

### Stage 2 — Adding the rig to the Proxmox cluster
*Status: ⏳ planned*

Installing Proxmox VE, joining it to the existing Necropolis cluster, and dealing with quorum on the new node count.

### Stage 3 — GPU passthrough
*Status: ⏳ planned*

Passing the RTX 3060 through to the VM/LXC that'll run detection.

### Stage 4 — The NVR stack (Frigate)
*Status: ⏳ planned*

Pulling the Tapo C210 RTSP streams into Frigate.

### Stage 5 — Local AI detection
*Status: ⏳ planned*

Object detection on the 3060 — person/car/package alerts, all local.

---
*Part of [FreyLab.systems](../README.md) · built on Necropolis*
