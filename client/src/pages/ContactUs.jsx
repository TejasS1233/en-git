import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MailIcon, MessageCircle, Github, ExternalLink, Bug, Star } from "lucide-react";

const contactDetails = [
  {
    icon: Github,
    title: "GitHub Repository",
    description: "View source code, report issues, and contribute.",
    link: "https://github.com/TejasS1233/en-git",
    text: "github.com/TejasS1233/en-git",
    buttonText: "View Repository",
  },
  {
    icon: Bug,
    title: "Report Issues",
    description: "Found a bug? Let us know on GitHub Issues.",
    link: "https://github.com/TejasS1233/en-git/issues",
    text: "Report an Issue",
    buttonText: "Open Issue",
  },
  {
    icon: Star,
    title: "Star the Project",
    description: "Show your support by starring the repository.",
    link: "https://github.com/TejasS1233/en-git",
    text: "Star on GitHub",
    buttonText: "Give a Star",
  },
  {
    icon: MailIcon,
    title: "Email",
    description: "Get in touch via email for general inquiries.",
    link: "mailto:tsss1552@gmail.com",
    text: "tsss1552@gmail.com",
    buttonText: "Send Email",
  },
  {
    icon: MessageCircle,
    title: "Discord",
    description: "Chat with the developer on Discord.",
    link: "#",
    text: "frozen_flames_42059",
    buttonText: "Message on Discord",
  },
  {
    icon: Github,
    title: "Developer Profile",
    description: "Check out more projects and contributions.",
    link: "https://github.com/TejasS1233",
    text: "github.com/TejasS1233",
    buttonText: "View Profile",
  },
];

const ContactPage = () => (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions, found a bug, or want to contribute? We'd love to hear from you!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contactDetails.map((item, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 flex items-center justify-center bg-primary/10 text-primary rounded-lg mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {item.buttonText}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Open Source Project</CardTitle>
          <CardDescription className="text-base">
            en-git is an open-source project. Contributions, bug reports, and feature requests are
            welcome!
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <a
              href="https://github.com/TejasS1233/en-git"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="h-5 w-5" />
              View on GitHub
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://github.com/TejasS1233/en-git/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Bug className="h-5 w-5" />
              Report an Issue
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default ContactPage;
