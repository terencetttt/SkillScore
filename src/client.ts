import { createClient } from "genlayer-js"
import { testnetBradbury } from "genlayer-js/chains"
import { ref } from "vue"

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`
export const walletAddress = ref<string>("")
export const isConnected = ref(false)

let _client: any = null

export async function connectWallet(): Promise<string> {
  const eth = (window as any).ethereum
  if (!eth) throw new Error("No wallet detected. Please install Rabby or MetaMask.")
  const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
  walletAddress.value = accounts[0]
  isConnected.value = true
  _client = createClient({ chain: testnetBradbury, account: accounts[0] as `0x${string}` })
  await _client.connect("testnetBradbury")
  return walletAddress.value
}

export function getClient() {
  if (!_client) throw new Error("Wallet not connected")
  return _client as any
}

export async function writeWithRetry(functionName: string, args: any[], onHash?: (hash: string) => void): Promise<{ hash: string; receipt: any }> {
  const client = getClient()
  const hash = await client.writeContract({ address: CONTRACT_ADDRESS, functionName, args: args as any, value: BigInt(0) })
  if (onHash) onHash(hash as string)
  const MAX_WAIT = 15 * 60 * 1000
  const INTERVAL = 12000
  const startTime = Date.now()
  while (Date.now() - startTime < MAX_WAIT) {
    await new Promise(r => setTimeout(r, INTERVAL))
    try {
      const tx = await (client as any).getTransaction({ hash })
      const status = typeof tx?.status === "number" ? tx.status : 0
      if (status >= 4) return { hash: hash as string, receipt: tx }
    } catch {}
  }
  throw new Error("Transaction timed out after 15 minutes. Your CV is still being processed on-chain.")
}

export async function readContract(functionName: string, args: any[] = []): Promise<any> {
  const client = getClient()
  return client.readContract({ address: CONTRACT_ADDRESS, functionName, args: args as any })
}

export async function pollTxStatus(hash: string): Promise<number> {
  const client = getClient()
  try {
    const tx = await (client as any).getTransaction({ hash })
    return typeof tx?.status === "number" ? tx.status : 0
  } catch { return 0 }
}

export function normaliseId(raw: any): string | null {
  if (raw === undefined || raw === null) return null
  try {
    const s = typeof raw === "bigint" ? raw.toString() : String(raw)
    return s.trim() === "" ? null : s
  } catch { return null }
}

export async function resolveLatestId(address: string): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const rec = await readContract("get_user_latest", [address])
      const id = normaliseId(rec?.id)
      if (id) return id
    } catch {}
    await new Promise(r => setTimeout(r, 4000))
  }
  try {
    const all = await readContract("get_all_analyses", [])
    if (Array.isArray(all) && all.length) {
      const mine = all.filter((r: any) => String(r?.submitter || "").toLowerCase() === address.toLowerCase())
      const pool = mine.length ? mine : all
      let best: any = null
      let bestNum = -1
      for (const r of pool) {
        const idStr = normaliseId(r?.id)
        const n = idStr ? Number(idStr) : -1
        if (n > bestNum) { bestNum = n; best = r }
      }
      return best ? normaliseId(best.id) : null
    }
  } catch {}
  return null
}

export function shortAddress(addr: string): string {
  if (!addr) return ""
  return addr.slice(0, 6) + "..." + addr.slice(-4)
}
