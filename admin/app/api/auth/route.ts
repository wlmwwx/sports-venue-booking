import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, password, username, token } = body;

    const cloudEnvId = process.env.CLOUD_ENV_ID || "your-env-id";
    const accessToken = await getAccessToken();
    const url = `https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=${accessToken}&env=${cloudEnvId}&name=authAdmin`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, phone, password, username, token }),
    });

    const result = await res.json();
    if (result.errcode) {
      return NextResponse.json({ success: false, error: result.errmsg }, { status: 400 });
    }
    return NextResponse.json(JSON.parse(result.resp_data));
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "请求失败" },
      { status: 500 }
    );
  }
}

let cachedToken = "";
let tokenExpireTime = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpireTime) return cachedToken;
  const appid = process.env.WECHAT_APPID || "your-appid";
  const secret = process.env.WECHAT_SECRET || "your-secret";
  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
  );
  const data = await res.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpireTime = Date.now() + (data.expires_in - 300) * 1000;
    return cachedToken;
  }
  throw new Error("获取 access_token 失败");
}
