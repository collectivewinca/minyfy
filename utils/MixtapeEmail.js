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
  
  export const MixtapeEmail = ({ imageUrl, name, shortenedLink }) => {
    const previewText = `Enjoy Your Vibe!`;

    const images = [
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/5.png?alt=media&token=c78225d7-c468-4417-be0b-7fc6496a46cb",
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/6.png?alt=media&token=4ab9d0a4-be8b-430c-bb88-b9520ee17918",
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/4.png?alt=media&token=d8a6ecee-2874-4594-a9e3-522f9e88ab59",
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/8.png?alt=media&token=e827316f-7f7f-4dd4-9194-c7334787a9ee",
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/9.png?alt=media&token=460e9876-f3e0-4e8a-9b6f-d4938c6b4e0b",
      "https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/7.png?alt=media&token=924f7447-dc9b-45ac-8823-7498729b49f4"
    ];
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section>
              <Row>
                <Text style={paragraph}>
                  Hi <strong>{name}</strong>,
                </Text>
                <Text style={paragraph}>
                  We're excited to let you know that your MINY Mixtape has been created. Enjoy your curated selection of tracks!
                </Text>
                <Img src={imageUrl} width="100%" alt="Mixtape Image" style={mixtapeImage} />
                <Button style={button} href={shortenedLink}>
                  Listen to Your Mixtape
                </Button>
                
                <Text style={paragraph}>
                  Visit{" "}
                  <Link style={link} href="https://minyfy.subwaymusician.xyz/collections">
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
                <strong>Listen Anytime:</strong> Your mixtape is ready to play. Click the button above to start listening.
              </Text>
              <Text style={paragraph}>
                <strong>Share the Vibes:</strong> Share your unique link with friends and family so they can enjoy the tunes too.
              </Text>
              <Text style={paragraph}>
                <strong>Explore More:</strong> Discover more amazing mixtapes and music at <Link style={link} href="https://minyvinyl.com">Miny Vinyl</Link>.
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
  
  export default MixtapeEmail;
  
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
    margin: "1.25rem 0"
  };
