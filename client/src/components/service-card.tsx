import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  CreditCard, 
  Users, 
  Store, 
  Home, 
  HandshakeIcon, 
  ClipboardList, 
  FileSignature
} from "lucide-react";

interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function ServiceCard({ id, title, description, icon }: ServiceCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "FileText":
        return <FileText className="h-6 w-6 text-primary" />;
      case "CreditCard":
        return <CreditCard className="h-6 w-6 text-primary" />;
      case "Users":
        return <Users className="h-6 w-6 text-primary" />;
      case "Store":
        return <Store className="h-6 w-6 text-primary" />;
      case "Home":
        return <Home className="h-6 w-6 text-primary" />;
      case "HandShake":
        return <HandshakeIcon className="h-6 w-6 text-primary" />;
      case "ClipboardList":
        return <ClipboardList className="h-6 w-6 text-primary" />;
      case "FileSignature":
        return <FileSignature className="h-6 w-6 text-primary" />;
      default:
        return <FileText className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="text-primary mb-3">
          {getIcon()}
        </div>
        <h3 className="font-medium text-lg mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        <Link href={`/user/submission/${id}`} className="text-amber-500 hover:text-amber-600 text-sm font-medium">
            Ajukan Sekarang →
        </Link>
      </CardContent>
    </Card>
  );
}
