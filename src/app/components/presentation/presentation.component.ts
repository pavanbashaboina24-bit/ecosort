import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Slide {
  title: string;
  subtitle: string;
  points: string[];
  presenter?: string;
}

@Component({
  selector: 'app-presentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent {
  current = signal(0);

  slides: Slide[] = [
    {
      title: 'AI-Based Smart Waste Segregation Assistant',
      subtitle: 'B.Tech CSE Internship Project | AI & Sustainability Initiative',
      presenter: 'Presented by: CSE Student Researcher',
      points: [
        'Aligns with United Nations SDGs for Green Smart Cities',
        'Leverages Artificial Intelligence for Automated Material Classification',
        'Combines Design Thinking, Edge AI, and Environmental Ecology',
        'Designed for households, campus, and public smart bins'
      ]
    },
    {
      title: '1. Problem Statement',
      subtitle: 'The Challenge of Unsegregated Municipal Solid Waste',
      points: [
        'Incorrect mix of Wet and Dry Waste reduces landfill recycling efficiency drastically.',
        'Average citizen lacks quick, contextual education on specialized waste packaging.',
        'Landfill waste generates toxic leachate and greenhouse gases like methane.',
        'How might we use AI to guide households instantly in correct segregation?'
      ]
    },
    {
      title: '2. SDG Alignment',
      subtitle: 'Targeting United Nations Global Sustainability Goals',
      points: [
        'SDG 11: Sustainable Cities and Communities — Promoting cleaner environments, lower air pollution, and optimized garbage handling infrastructure.',
        'SDG 12: Responsible Consumption and Production — Increasing circular recycling loops and ensuring dangerous elements are intercepted.',
        'Direct reduction in solid waste footprint and lower energy expenditures.'
      ]
    },
    {
      title: '3. Proposed AI Solution',
      subtitle: 'A Smart Conversational & Vision Classification Framework',
      points: [
        'Multimodal Processing: Natural Language inputs + visual image analysis capability.',
        'Advanced Reasoning: Real-time REST API classification via Spring Boot + local heuristics.',
        'Actionable Guidelines: Clear bin assignments (Green, Blue, Red, Yellow) paired with immediate safety and ecological instructions.',
        'High accessibility via Angular web interfaces, conversational apps, or public kiosk APIs.'
      ]
    },
    {
      title: '4. System Architecture & Workflow',
      subtitle: 'How It Works (Dataflow Structure)',
      points: [
        'User Interface: Angular 17 SPA captures item keywords via REST calls to Spring Boot.',
        'AI Engine: Classification via local heuristics + MySQL database entity recognition.',
        'Safety Guardrails: Keyword checks for hazardous objects, biomedical waste, or electronics.',
        'Output Panel: Renders Category, Bin Assignment, Disposal Action, and an educational Eco-Tip.'
      ]
    },
    {
      title: '5. Sample Inputs & Outputs',
      subtitle: 'Test Matrix Results Demonstration',
      points: [
        'Banana Peel ➡️ Wet Waste ➡️ Compost Bin (Green)',
        'Plastic Bottle ➡️ Recyclable ➡️ Empty & Crush Bin (Blue)',
        'Li-ion Battery ➡️ Hazardous ➡️ E-Waste Drop Center (Red/Black)',
        'Corrugated Box ➡️ Dry Waste ➡️ Dry Materials Area (Blue/Grey)'
      ]
    },
    {
      title: '6. Design Thinking & Prototyping',
      subtitle: 'Human-Centered Product Development',
      points: [
        'Empathize: Understand user fatigue with multi-bin rules.',
        'Define: Spot the bottleneck — confusion at point-of-disposal.',
        'Ideate: An interactive AI guide requiring zero manuals.',
        'Prototype: Angular 17 + Spring Boot 3.2 + MySQL full-stack application.',
        'Test: Validating accuracy against municipal standards.'
      ]
    },
    {
      title: '7. Responsible AI Considerations',
      subtitle: 'Ethics, Bias, and Trust Matrix',
      points: [
        'Fairness: Performs equally across localized object naming conventions.',
        'Transparency: Explains why an item is categorized in a specific way.',
        'Privacy Protected: No facial tracking or unnecessary household personal metadata collected.',
        'Reliability: Solid fallback mechanisms if external API signals are lost.'
      ]
    },
    {
      title: '8. Expected Impact Metrics',
      subtitle: 'Measurable Environmental & Economic Outcomes',
      points: [
        'Social: Increased community pride and direct behavioral nudge.',
        'Environmental: 30%+ reduction in wet waste contaminating recyclable dry streams.',
        'Economic: Lowers manual labor segregation expenses in municipal recycling warehouses.',
        'Commercial: Clean raw recycling supply chains fetch higher commodity prices.'
      ]
    },
    {
      title: '9. Future Enhancements & IoT Integration',
      subtitle: 'The Road to Hardware-Embedded Environments',
      points: [
        'Computer Vision: Live camera object tracking at the bin throat using Edge AI.',
        'IoT Actuators: Servo motors automatically opening specific bin flaps.',
        'Multi-lingual: Audio feedback in local vernacular languages for public deployment.',
        'Gamified rewards: QR code scanning to award carbon credits to citizens.'
      ]
    },
    {
      title: '10. Conclusion & Takeaway',
      subtitle: 'B.Tech Internship Summary',
      points: [
        'Demonstrates that lightweight AI deployment makes immediate sustainable impacts.',
        'Practical application of modern full-stack tech on everyday household challenges.',
        'Bridges computer science training directly with actionable civic solutions.',
        'Ready to scale into cross-platform companion apps or public hardware kiosks.'
      ]
    }
  ];

  prev() { this.current.update(i => Math.max(0, i - 1)); }
  next() { this.current.update(i => Math.min(this.slides.length - 1, i + 1)); }
  goTo(i: number) { this.current.set(i); }

  get slide() { return this.slides[this.current()]; }
  get isFirst() { return this.current() === 0; }
  get isLast()  { return this.current() === this.slides.length - 1; }
}
