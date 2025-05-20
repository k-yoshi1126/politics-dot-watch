import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  return (
    <div className="container mx-auto py-12">

      <Card className="mb-8 border-muted">
        <CardHeader>
          <CardTitle>サービスについて</CardTitle>
          <CardDescription>政治ドットウォッチの基本情報</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm">このサービスは何ですか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                本サービスは、国会で審議される法案の内容をAIで要約し、わかりやすく提供するとともに、
                利用者が法案に対する賛成・反対・棄権の意思表示ができるプラットフォームです。
                政治参加意識の向上と、国民の政治への関心を高めることを目的としています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm">誰が運営していますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                本サービスは、政治的中立性を保ちながら、国民の政治参加を促進することを目的とした
                非営利団体によって運営されています。特定の政党や企業からの資金提供は受けていません。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-sm">利用料金はかかりますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                本サービスは完全無料でご利用いただけます。今後も基本的な機能は無料で提供する予定です。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8 border-muted">
        <CardHeader>
          <CardTitle>法案データについて</CardTitle>
          <CardDescription>法案データの取得と処理に関する質問</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-sm">法案データはどこから取得していますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                参議院・衆議院の公式サイト、国会会議録等の公開情報から、
                スクレイピング技術を用いて自動的に取得しています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger className="text-sm">法案の要約はどのように作成されていますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                法案の全文をAI（ChatGPT API等）を用いて要約し、その後、管理者が内容を確認・修正した上で
                公開しています。客観性と正確性を担保するため、公開前の確認プロセスを設けています。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger className="text-sm">法案データはどのくらいの頻度で更新されますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                新規法案データは毎週1回の定期バッチ処理で取得・更新しています。
                重要な法案や緊急性の高い法案については、随時更新する場合もあります。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="mb-8 border-muted">
        <CardHeader>
          <CardTitle>アカウントと投票について</CardTitle>
          <CardDescription>アカウント登録と投票機能に関する質問</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-sm">アカウント登録は必要ですか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                法案の閲覧はアカウント登録なしでも可能です。ただし、賛成・反対・棄権の投票や
                投票履歴の確認には、アカウント登録が必要となります。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger className="text-sm">投票結果はどのように利用されますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                投票結果は集計され、各法案ページで公開されます。これにより、国民の意見の傾向を
                可視化することができます。なお、個人が特定される形での公開は行いません。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger className="text-sm">一度投票した後で、投票内容を変更できますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                はい、投票内容は変更可能です。法案の詳細ページから、いつでも賛成・反対・棄権の
                投票内容を変更することができます。最新の投票内容が記録されます。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle>その他</CardTitle>
          <CardDescription>その他のよくある質問</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-sm">法案に関する意見や議論はできますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                現在、コメント機能やディスカッション機能は提供していません。
                将来的には、建設的な議論ができる場を設ける予定です。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11">
              <AccordionTrigger className="text-sm">不具合や改善要望はどこに報告すればよいですか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                「お問い合わせ」ページからご報告いただけます。いただいたフィードバックは
                サービス改善のために活用させていただきます。
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger className="text-sm">SNSでの共有はできますか？</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed">
                はい、各法案ページには共有ボタンがあり、X（旧Twitter）、Facebook、LINEなどの
                SNSで簡単に共有することができます。
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
