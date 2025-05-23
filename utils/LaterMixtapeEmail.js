import {
    Body,
    Button,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
  } from "@react-email/components";
  import * as React from "react";
  
  export const LaterMixtapeEmail = ({ imageUrl, name, shortenedLink, displayName }) => {
    const previewText = ` Share Your Musical Creation!`;

  
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section>
              <Row>
                <Text style={paragraph}>
                  Hi <strong>{displayName}</strong>,
                </Text>
                <Text style={paragraph}>
                Your MINY mixtape is ready, and {name} looks (and sounds) amazing! 🎶
                </Text>
                <Text style={paragraph}>
                We’ve crafted your mixtape into a shareable image that you can download and show off to your friends, family, or even the whole world. 
                </Text>
                <Text style={paragraph}>
                This is your musical masterpiece, so don’t be shy – share the love!
                </Text>
                <Link 
                  href={shortenedLink}
                  style={{
                    backgroundColor: '#f0f0f0',
                    border: '2px solid #ff5722',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    margin: '20px 0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'block', // Change display to block
                    textAlign: 'center', // Ensure text is centered
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span style={{ 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#333',
                    wordBreak: 'break-word' // Ensure the link breaks nicely on long URLs
                  }}>
                    {shortenedLink}
                  </span>
                </Link>
                <Img src={imageUrl} width="100%" alt="Mixtape Image" style={mixtapeImage} />
                
                <Button style={button} href={shortenedLink}>
                  Listen to Your {name} Mixtape
                </Button>
                
                <Text style={paragraph}>
                  Visit{" "}
                  <Link style={link} href="https://minyfy.minyvinyl.com/collections">
                    your collection
                  </Link>{" "}
                  to view more details of your mixtape.
                </Text>
              </Row>
            </Section>
            <Hr style={hr} />
            <Section>
              <Text style={subheading}>What's Next?</Text>
              <Text style={paragraph}>
                You can also directly share it from the app or on your favorite social media platforms.
                </Text>
                <Text style={paragraph}>
                If you’d like to make any changes or add more tracks, feel free to hop back into the app. Your mixtape journey is just getting started!
                </Text>
                <Text style={paragraph}>
                Thanks for being a part of MINY. Keep the music alive!
                </Text>
            </Section>
            <Hr style={hr} />
            <Section>
              <Text style={{ ...paragraph, fontWeight: "700", fontSize: "1.375rem" }}>
                Need Assistance?
              </Text>
              <Text style={paragraph}>
                Our support team is here to help you with any questions or issues regarding your mixtape. If you need assistance, please contact us at hello@minyvinyl.com.
              </Text>
              <Text style={paragraph}>
                Thank you for choosing Miny Vinyl for your music needs. We hope you enjoy your new mixtape and look forward to serving you again soon!
              </Text>
              <Text style={paragraph}>Best regards,</Text>
              <Text style={paragraph}>
                Miny Vinyl Team{" "}
                <Link href={"https://minyvinyl.com"} style={footerLink}>
                  minyvinyl.com
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default LaterMixtapeEmail;
  
  const main = {
    backgroundColor: "#fff",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    color: "#333",
  };
  
  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "1.25rem",
    width: "40rem",
    maxWidth: "100%",
    borderRadius: "0.5rem",
    boxShadow: "0 0 1.25rem rgba(0, 0, 0, 0.1)",
  };
  
  const header = {
    backgroundColor: "#000",
    padding: "1.25rem 1.25rem 2.5rem 1.25rem",
    textAlign: "center",
  };
  
  const logo = {
    display: "block",
    margin: "0 auto 0.625rem",
  };
  
  const headerText = {
    color: "#ffffff",
    fontSize: "1.5rem",
    fontWeight: "bold",
    margin: 0,
  };
  
  const subheading = {
    fontSize: "1.375rem",
    fontWeight: "700",
    color: "#333",
    marginBottom: "0.625rem",
  };
  
  const paragraph = {
    fontSize: "1.125rem",
    lineHeight: "1.4",
    color: "#484848",
  };
  
  const button = {
    backgroundColor: "#ff5722",
    borderRadius: "0.3125rem",
    color: "#ffffff",
    fontSize: "1.125rem",
    padding: "0.9375rem 1.25rem",
    textDecoration: "none",
    textAlign: "center",
    display: "block",
    margin: "1.25rem auto 0",
    width: "fit-content",
    fontWeight: "bold",
  };
  
  const link = {
    color: "#ff5722",
    textDecoration: "underline",
  };
  
  const footerLink = {
    color: "#ff5722",
    textDecoration: "none",
    display: "block",
    marginTop: "1.1rem",
    fontWeight: "bold",
  };
  
  const hr = {
    borderColor: "#dddddd",
    margin: "0.625rem 0",
  };
  
  const mixtapeImage = {
    margin: "1.25rem 0",
    aspectRatio: "cos(30deg)",
    objectFit: "cover",
    clipPath: "polygon(-50% 50%,50% 100%,150% 50%,50% 0)",
  };
