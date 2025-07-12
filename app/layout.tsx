// app/layout.tsx

// 이 파일은 모든 페이지의 기본 뼈대가 됩니다.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <h1>여기는 레이아웃입니다.</h1>
        <hr />
        {children}
      </body>
    </html>
  );
}