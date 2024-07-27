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
  
  export const PurchaseEmail = ({ name, title, shortenedLink }) => {
    const previewText = `Your MINY Order with ${title}'s Mixtape is confirmed!`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={header}>
              <Img
                src="https://firebasestorage.googleapis.com/v0/b/minyfy-e8c97.appspot.com/o/stamp.png?alt=media&token=c7c325ef-53fb-4381-b7b0-b3607d19d261"
                width={100}
                height={60}
                alt="MINY Logo"
                style={logo}
              />
              <Text style={headerText}>
                Thank You for Your MINY Mixtape Purchase!
              </Text>
            </Section>
            <Section>
              <Row>
                
                <Text style={paragraph}>
                  Hi <strong>{name}</strong>,
                </Text>
                <Text style={paragraph}>
                  We're thrilled to let you know that your order for {title}'s
                  Mixtape has been confirmed. Get ready for an unforgettable
                  musical journey!
                </Text>
                <Button style={button} href={shortenedLink}>
                  Listen to Your Mixtape
                </Button>
                <Text style={paragraph}>
                  Visit{" "}
                  <Link style={link} href="https://minyfy.subwaymusician.xyz/crates">
                    your crates
                  </Link>{" "}
                  to view more details of your order.
                </Text>
              </Row>
            </Section>
            <Hr style={hr} />
            <Section>
              <Text style={subheading}>What's Next?</Text>
              <Text style={paragraph}>
                <strong>Listen Anytime:</strong> Your mixtape is ready to play.
                Click the button above to dive into your tracks.
              </Text>
              <Text style={paragraph}>
                <strong>Share the Vibes:</strong> Share your unique link with
                friends and family so they can enjoy the tunes too.
              </Text>
              <Text style={paragraph}>
                <strong>Explore More:</strong> Discover more amazing mixtapes and
                music at <Link style={link} href="https://minyvinyl.com">Miny Vinyl</Link>.
              </Text>
            </Section>
            <Hr style={hr} />
            <Section>
              <Text style={{ ...paragraph, fontWeight: "700", fontSize: "1.375rem" }}>
                Need Assistance?
              </Text>
              <Text style={paragraph}>
                Our support team is here to help you with any questions or issues
                regarding your order. If you need assistance, please contact us at
                hello@minyvinyl.com.
              </Text>
              <Text style={paragraph}>
                Thank you for choosing Miny Vinyl for your music needs. We hope
                you enjoy your new mixtape and look forward to serving you again
                soon!
              </Text>
              <Text style={paragraph}>Best regards,</Text>
              <Text style={paragraph}>
                Miny Vinyl Team{" "}
                <Link  href={"https://minyvinyl.com"} style={footerLink}>
                  minyvinyl.com
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default PurchaseEmail;
  
  const main = {
    backgroundColor: "#ffff",
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
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: 0,
  };
  
  const heading = {
    fontSize: "1.375rem",
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    margin: "1.25rem 0",
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
  