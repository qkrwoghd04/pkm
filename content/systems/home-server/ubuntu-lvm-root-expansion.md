---
visibility: public
id: systems/home-server/ubuntu-lvm-root-expansion
title: Ubuntu LVM으로 남은 디스크 공간을 루트 파일시스템에 추가하기
description: >-
  SSD 전체 용량과 실제 사용 가능한 파일시스템 용량의 차이, Ubuntu의 100GiB 기본 할당, LVM 확장 명령과 점검한 서버 확인
  상태.
status: active
updated: 2026-09-23
tags:
  - domain/infrastructure
  - tech/ubuntu
  - tech/lvm
  - concern/operations
  - concern/storage
---

> [!summary]
> 물리 SSD에 공간이 남아 있어도 운영체제가 사용하는 파일시스템에는 일부만 할당되어 있을 수 있음. LVM 볼륨 그룹의 미할당 공간을 논리 볼륨에 추가하고 파일시스템을 확장하면, SSD를 교체하지 않고도 사용할 수 있는 공간을 늘리는 것이 가능.
>
> 점검한 서버에서는 디스크 구조까지만 확인한 상태. sudo 인증이 필요해 실제 VG 여유 공간 확인과 확장은 아직 미실행.

## 알게 된 계기

512GB SSD를 사용하는 Ubuntu 서버에서 루트 볼륨은 100GiB만 할당된 구성을 확인. 저장 장치를 추가하지 않고 기존 미할당 공간을 배정할 수 있다는 점을 이해하기 위한 사례.

이 사례의 수치는 2026-09-23 KST에 확인한 명령 출력 기준이며, 실제 확장 절차의 실행 완료 기록은 아님.

## 왜 SSD 전체를 바로 사용하지 않는가

저장소는 다음 단계로 나뉨.

```text
물리 SSD
  └─ 파티션
      └─ LVM 물리 볼륨(PV)
          └─ 볼륨 그룹(VG): 할당할 수 있는 공간의 묶음
              ├─ 논리 볼륨(LV): 루트 파일시스템에 배정한 공간
              │   └─ ext4 파일시스템: 실제 파일을 저장하는 영역
              └─ 아직 논리 볼륨에 배정하지 않은 공간
```

Ubuntu Server 설치 프로그램의 기본 LVM `scaled` 정책은 VG 용량이 200GiB보다 크면 루트에 100GiB를 할당하고 나머지는 추후 확장과 다른 볼륨 등에 사용할 수 있도록 남기는 방식. 점검한 서버의 100GiB 구성도 이 정책과 일치하지만, 실제 설치 당시 선택은 확인하지 않아 원인으로 확정하지 않음.

근거: [Ubuntu 설치 프로그램의 sizing-policy](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html#sizing-policy).

## 점검한 서버에서 확인한 구성

| 구분                   | 확인값                             | 의미                     |
| ---------------------- | ---------------------------------- | ------------------------ |
| 물리 SSD `nvme0n1`     | 512,110,190,592 bytes, 약 476.9GiB | 제조사 표기 약 512GB     |
| EFI 파티션             | 약 1GiB                            | 부팅용                   |
| /boot 파티션           | 약 2GiB                            | 부팅 파일용              |
| LVM 파티션 `nvme0n1p3` | 약 473.9GiB                        | LVM2_member              |
| 루트 LV                | 100GiB                             | `/`에 연결, ext4         |
| `df -h /` 전체         | 98G                                | 파일시스템이 보고한 용량 |
| 사용 중                | 44G                                | 확인 시점 기준           |
| 일반 사용 가능         | 50G                                | 확인 시점 기준           |

GB는 10진 단위, GiB는 2진 단위. 512GB SSD가 약 477GiB로 보이는 것은 단위 차이. LV의 100GiB와 `df`의 98G 차이는 파일시스템 관리 공간과 표시 방식의 차이. 전체에서 사용량을 뺀 값이 available과 정확히 같지 않은 것은 ext4 예약 공간 등의 영향도 있음.

473.9GiB와 100GiB의 차이는 약 374GiB지만, 이 차이를 곧바로 확정된 여유 공간으로 간주하면 안 됨. 실제 VG 여유 extents와 다른 LV 존재 여부는 `vgs`, `lvs`로 확인 필요.

## 확장 전 확인

서버에 SSH로 접속한 터미널에서 실행.

```bash
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
findmnt -no SOURCE,FSTYPE /
df -h /
sudo vgs -o vg_name,vg_size,vg_free
sudo lvs -o vg_name,lv_name,lv_path,lv_size,lv_attr
```

- `lsblk`: 물리 디스크, 파티션, LV의 계층과 크기 확인.
- `findmnt`: 실제 루트 장치와 파일시스템 확인.
- `df`: 파일을 저장할 수 있는 현재 용량 확인.
- `vgs`의 `VFree`: 지금 LV에 추가로 할당 가능한 공간.
- `lvs`: 정확한 대상 LV 경로 및 다른 LV 확인.

`sudo: a password is required`는 현재 원격 실행에서 관리자 인증을 제공할 수 없다는 의미. 인증은 관리자 본인의 터미널에서 수행.

## 남은 VG 공간을 루트에 모두 추가하는 명령

아래 명령은 VG가 `example-vg`, 루트 LV가 `/dev/example-vg/root`인 예시. 실제 실행 전 `vgs`, `lvs`, `findmnt` 결과에 맞게 이름을 교체하고 다음 조건 확인.

- 루트 LV가 `/dev/example-vg/root`이고 파일시스템이 ext4.
- `example-vg`의 `VFree`가 충분하며 다른 용도로 남겨 둘 공간이 불필요.
- 중요한 데이터의 별도 백업 확보. 아래 `vgcfgbackup`은 파일 데이터 백업을 대신하지 않음.

```bash
sudo vgcfgbackup example-vg
sudo lvextend -r -l +100%FREE /dev/example-vg/root
df -h /
```

| 부분                     | 의미                                              |
| ------------------------ | ------------------------------------------------- |
| `vgcfgbackup example-vg` | 현재 LVM 구성 메타데이터 백업                     |
| `lvextend`               | 논리 볼륨 크기 확장                               |
| `-l +100%FREE`           | 해당 VG의 남은 여유 extents 전부를 기존 LV에 추가 |
| `-r`                     | 파일시스템도 함께 확장                            |
| `/dev/example-vg/root`   | 확장할 대상 LV                                    |

일반적인 ext4는 마운트 상태의 온라인 확장 지원. 따라서 조건이 맞으면 서비스가 동작하는 상태에서 확장 가능. 실제 완료는 명령 성공과 `df`, `lvs` 결과로 확인해야 함.

LVM 메타데이터 백업은 디렉터리와 파일을 복원하는 백업이 아니며, 확장 후 원래 크기로 축소하는 절차도 자동으로 제공하지 않음.

## 일부 공간만 추가하려면

모두 할당하는 대신 100GiB만 추가하는 예시. 위 전체 확장 명령과 함께 연속 실행하는 것이 아니라 둘 중 목적에 맞는 방식 하나를 선택.

```bash
sudo lvextend -r -L +100G /dev/example-vg/root
```

`+100G`는 현재 크기에 100GiB를 더한다는 의미. 예를 들어 기존 LV가 100GiB라면 결과는 200GiB. 새 디스크를 장착하거나 파티션을 늘리는 작업과는 별개.

VG 여유 공간이 없다면 이 명령만으로 용량을 늘릴 수 없음. 그 경우 더 큰 가상 디스크 반영, PV 확장, 추가 디스크 편입 등 현재 구성에 맞는 별도 절차가 필요.

## 적용 후 확인

```bash
sudo lvs -o lv_path,lv_size
df -h /
```

성공 기준은 LV와 파일시스템 두 계층의 용량이 모두 증가한 상태. VG를 거의 모두 할당했다면 `vgs`의 `VFree`가 0에 가깝게 보이는 것이 정상이며, 이것이 파일시스템의 저장 공간 부족을 의미하지는 않음. 실제 파일 저장 여유는 `df -h /`의 `Avail`로 확인.

`lvextend`가 오류를 반환하면 무작정 재실행하지 않고 LV와 파일시스템의 현재 크기부터 재확인. LV만 확장되고 파일시스템 확장이 실패한 부분 완료 상태일 수 있음.

## 점검 사례의 검증 범위

- 확인 완료: 물리 SSD, 파티션, 표시된 루트 LV, ext4, 파일시스템 사용량.
- 추정: 설치 프로그램의 기본 100GiB 할당 정책 사용 가능성.
- 미확인: 실제 VG free extents, 전체 LV 목록의 관리자 조회.
- 미실행: `vgcfgbackup`, `lvextend`, 파일시스템 확장.
- 중단 이유: 원격 sudo 실행에 비밀번호 인증 필요.
- 다음 확인: 관리자가 터미널에서 인증 후 확장하고 `lvs` 및 `df -h /` 결과 확인.

## 관련 문서

- [[setup|Ubuntu 홈서버 초기 구축]]
- [[networking|SSH와 Tailscale 네트워크 운영]]
- [[index|Home Server 지식 지도]]

## 공식 자료

- [Ubuntu 설치 프로그램 LVM 용량 정책](https://canonical-subiquity.readthedocs-hosted.com/en/latest/reference/autoinstall-reference.html#sizing-policy)
- [Ubuntu lvextend 매뉴얼](https://manpages.ubuntu.com/manpages/noble/man8/lvextend.8.html)
- [Ubuntu resize2fs 매뉴얼](https://manpages.ubuntu.com/manpages/noble/man8/resize2fs.8.html)
- [Ubuntu vgcfgbackup 매뉴얼](https://manpages.ubuntu.com/manpages/noble/man8/vgcfgbackup.8.html)
