// テスト用のユーザーデータ
export const testUsers = [
  {
    id: "user-001",
    name: "テストユーザー",
    email: "test@example.com",
    password: "password123", // 実際のアプリでは平文でパスワードを保存しないでください
    createdAt: "2023-01-15",
  },
  {
    id: "user-002",
    name: "山田太郎",
    email: "yamada@example.com",
    password: "yamada123",
    createdAt: "2023-02-20",
  },
  {
    id: "user-003",
    name: "佐藤花子",
    email: "sato@example.com",
    password: "sato123",
    createdAt: "2023-03-10",
  },
]

// テスト用の投票データ
export const testVotes = [
  {
    id: "vote-001",
    userId: "user-001",
    billId: "bill-2023-001",
    vote: "agree",
    createdAt: "2023-10-20",
  },
  {
    id: "vote-002",
    userId: "user-001",
    billId: "bill-2023-002",
    vote: "disagree",
    createdAt: "2023-10-21",
  },
  {
    id: "vote-003",
    userId: "user-001",
    billId: "bill-2023-004",
    vote: "abstain",
    createdAt: "2023-12-05",
  },
  {
    id: "vote-004",
    userId: "user-002",
    billId: "bill-2023-001",
    vote: "agree",
    createdAt: "2023-10-22",
  },
  {
    id: "vote-005",
    userId: "user-002",
    billId: "bill-2023-003",
    vote: "agree",
    createdAt: "2023-11-25",
  },
  {
    id: "vote-006",
    userId: "user-003",
    billId: "bill-2023-002",
    vote: "disagree",
    createdAt: "2023-09-10",
  },
]

// テスト用の認証関数
export const authenticateUser = (email: string, password: string) => {
  const user = testUsers.find((user) => user.email === email && user.password === password)
  return user ? { ...user, password: undefined } : null
}

// ユーザーIDから投票履歴を取得する関数
export const getUserVotes = (userId: string) => {
  return testVotes.filter((vote) => vote.userId === userId)
}
