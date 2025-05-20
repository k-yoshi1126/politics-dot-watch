export interface Bill {
  id: string
  title: string
  summary: string
  status: "審議前" | "審議中" | "可決" | "否決"
  category: string
  submittedDate: string
  submittedBy: string
  fullText: string
  aiSummary: string
  impactAreas: string[]
  isPriority?: boolean
  timeline?: {
    date: string
    event: string
  }[]
  relatedBills?: {
    id: string
    title: string
  }[]
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface Vote {
  id: string
  billId: string
  userId: string
  vote: "agree" | "disagree" | "abstain"
  createdAt: string
}
