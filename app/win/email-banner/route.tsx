import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            backgroundImage:
              "url(https://pl-booking.vercel.app/images/win-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            fontFamily: "system-ui, sans-serif",
            position: "relative",
          }}
        >
          {/* Overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background:
                "linear-gradient(to right, rgba(18,45,40,0.92) 0%, rgba(18,45,40,0.88) 65%, rgba(18,45,40,0.7) 100%)",
            }}
          />

          {/* Content row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              padding: "0 32px",
              position: "relative",
              gap: 24,
            }}
          >
            {/* Logo symbol only */}
            <svg
              height="48"
              viewBox="0 0 409 409"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M61.6996 30.8498C61.6996 47.8877 47.8877 61.6996 30.8498 61.6996C13.8119 61.6996 0 75.5115 0 92.5494V201.71V310.871C0 327.909 13.8119 341.721 30.8498 341.721C47.8877 341.721 61.6996 355.533 61.6996 372.571V374.944C61.6996 393.292 76.574 408.166 94.9224 408.166H201.71H308.498C326.846 408.166 341.721 393.292 341.721 374.944C341.721 356.595 356.595 341.721 374.944 341.721C393.292 341.721 408.166 326.846 408.166 308.498V201.71V94.9224C408.166 76.574 393.292 61.6996 374.944 61.6996H372.571C355.533 61.6996 341.721 47.8877 341.721 30.8498C341.721 13.8119 327.909 0 310.871 0H201.71H92.5494C75.5115 0 61.6996 13.8119 61.6996 30.8498ZM312.058 119.199C303.844 125.328 299.006 134.975 299.006 145.223V213.969V261.378C299.006 282.148 282.148 298.976 261.378 298.939L188.658 298.811L98.6153 298.656C91.6346 298.644 88.4327 289.957 93.7359 285.418L96.0303 283.453C104.364 276.317 109.161 265.894 109.161 254.922V190.685V146.775C109.161 126.01 126.01 109.184 146.775 109.214L217.135 109.313L308.824 109.438C314.035 109.445 316.233 116.083 312.058 119.199Z"
                fill="white"
              />
            </svg>

            {/* Text stack */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#FFB345",
                  letterSpacing: "0.1em",
                }}
              >
                BOOK A DEMO TO WIN
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1.2,
                }}
              >
                Win an all-inclusive trip to the Caribbean for 2
              </div>
            </div>

            {/* Right: CTA button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#0E8A52",
                color: "white",
                fontSize: 14,
                fontWeight: 700,
                padding: "10px 20px",
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              Book a Demo →
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 120,
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
