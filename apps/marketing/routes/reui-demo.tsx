import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/reui/alert";
import { Badge } from "@repo/ui/components/reui/badge";
import {
	Frame,
	FrameDescription,
	FrameFooter,
	FrameHeader,
	FramePanel,
	FrameTitle,
} from "@repo/ui/components/reui/frame";
import { IconStack } from "@repo/ui/components/reui/icon-stack";
import { IconTile } from "@repo/ui/components/reui/icon-tile";
import { Rating } from "@repo/ui/components/reui/rating";
import {
	Stepper,
	StepperContent,
	StepperIndicator,
	StepperItem,
	StepperNav,
	StepperPanel,
	StepperSeparator,
	StepperTrigger,
} from "@repo/ui/components/reui/stepper";
import {
	Timeline,
	TimelineContent,
	TimelineDate,
	TimelineHeader,
	TimelineIndicator,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@repo/ui/components/reui/timeline";
import { Switch } from "@repo/ui/components/switch";
import { createFileRoute } from "@tanstack/react-router";
import {
	BellIcon,
	CheckCircle2Icon,
	FolderIcon,
	InfoIcon,
	RocketIcon,
	SettingsIcon,
	TriangleAlertIcon,
	XCircleIcon,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/reui-demo")({
	component: ReuiDemoPage,
	head: () => ({
		meta: [{ title: "ReUI Demo" }],
	}),
});

const badgeSolidVariants = [
	"default",
	"secondary",
	"outline",
	"info",
	"success",
	"warning",
	"destructive",
	"focus",
	"invert",
] as const;

const badgeLightVariants = [
	"primary-light",
	"info-light",
	"success-light",
	"warning-light",
	"destructive-light",
	"focus-light",
	"invert-light",
] as const;

const badgeOutlineVariants = [
	"primary-outline",
	"info-outline",
	"success-outline",
	"warning-outline",
	"destructive-outline",
	"focus-outline",
	"invert-outline",
] as const;

const badgeSizes = ["xs", "sm", "default", "lg", "xl"] as const;

const iconTileVariants = ["outline", "elevated", "soft", "solid", "frame"] as const;

const stepperSteps = [1, 2, 3, 4];

function ReuiDemoPage() {
	const [rating, setRating] = useState(3);
	const [switchOn, setSwitchOn] = useState(true);

	return (
		<div className="py-12 md:py-16">
			<div className="space-y-6 container">
				<div>
					<h1 className="font-bold text-3xl">ReUI 组件演示</h1>
					<p className="mt-1 text-muted-foreground">
						ReUI（base-nova）组件在本项目主题下的渲染效果，与现有 @repo/ui 组件对照。
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Badge</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="gap-2 flex flex-wrap items-center">
							{badgeSolidVariants.map((variant) => (
								<Badge key={variant} variant={variant}>
									{variant}
								</Badge>
							))}
						</div>
						<div className="gap-2 flex flex-wrap items-center">
							{badgeLightVariants.map((variant) => (
								<Badge key={variant} variant={variant}>
									{variant}
								</Badge>
							))}
						</div>
						<div className="gap-2 flex flex-wrap items-center">
							{badgeOutlineVariants.map((variant) => (
								<Badge key={variant} variant={variant}>
									{variant}
								</Badge>
							))}
						</div>
						<div className="gap-2 flex flex-wrap items-center">
							{badgeSizes.map((size) => (
								<Badge key={size} size={size}>
									{size}
								</Badge>
							))}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Alert</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<Alert>
							<BellIcon />
							<AlertTitle>默认提示</AlertTitle>
							<AlertDescription>常规信息通知，无特定语义色。</AlertDescription>
						</Alert>
						<Alert variant="info">
							<InfoIcon />
							<AlertTitle>信息</AlertTitle>
							<AlertDescription>版本 2.4 已发布，查看更新日志。</AlertDescription>
						</Alert>
						<Alert variant="success">
							<CheckCircle2Icon />
							<AlertTitle>成功</AlertTitle>
							<AlertDescription>配置已保存并即时生效。</AlertDescription>
						</Alert>
						<Alert variant="warning">
							<TriangleAlertIcon />
							<AlertTitle>警告</AlertTitle>
							<AlertDescription>本月用量已达 80%。</AlertDescription>
						</Alert>
						<Alert variant="destructive">
							<XCircleIcon />
							<AlertTitle>错误</AlertTitle>
							<AlertDescription>支付失败，请检查银行卡信息。</AlertDescription>
						</Alert>
						<Alert variant="invert">
							<RocketIcon />
							<AlertTitle>反色</AlertTitle>
							<AlertDescription>高对比样式，用于强调场景。</AlertDescription>
						</Alert>
					</CardContent>
				</Card>

				<div className="gap-6 lg:grid-cols-2 grid">
					<Card>
						<CardHeader>
							<CardTitle>Stepper</CardTitle>
						</CardHeader>
						<CardContent>
							<Stepper defaultValue={2} className="space-y-8 w-full">
								<StepperNav>
									{stepperSteps.map((step) => (
										<StepperItem key={step} step={step}>
											<StepperTrigger>
												<StepperIndicator>{step}</StepperIndicator>
											</StepperTrigger>
											{stepperSteps.length > step && (
												<StepperSeparator className="group-data-[state=completed]/step:bg-primary" />
											)}
										</StepperItem>
									))}
								</StepperNav>
								<StepperPanel className="text-sm">
									{stepperSteps.map((step) => (
										<StepperContent
											key={step}
											value={step}
											className="flex items-center justify-center"
										>
											第 {step} 步内容
										</StepperContent>
									))}
								</StepperPanel>
							</Stepper>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Rating</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<Rating rating={4} />
							<Rating rating={3.5} showValue />
							<Rating rating={rating} editable onRatingChange={setRating} showValue />
							<Rating rating={2} maxRating={3} size="lg" />
						</CardContent>
					</Card>
				</div>

				<div className="gap-6 lg:grid-cols-2 grid">
					<Card>
						<CardHeader>
							<CardTitle>Timeline</CardTitle>
						</CardHeader>
						<CardContent>
							<Timeline defaultValue={2} className="w-full">
								<TimelineItem step={1}>
									<TimelineHeader>
										<TimelineDate>2026 年 3 月</TimelineDate>
										<TimelineTitle>项目启动</TimelineTitle>
									</TimelineHeader>
									<TimelineIndicator />
									<TimelineSeparator />
									<TimelineContent>完成仓库初始化与基础架构搭建。</TimelineContent>
								</TimelineItem>
								<TimelineItem step={2}>
									<TimelineHeader>
										<TimelineDate>2026 年 4 月</TimelineDate>
										<TimelineTitle>Beta 发布</TimelineTitle>
									</TimelineHeader>
									<TimelineIndicator />
									<TimelineSeparator />
									<TimelineContent>面向早期用户开放测试并收集反馈。</TimelineContent>
								</TimelineItem>
								<TimelineItem step={3}>
									<TimelineHeader>
										<TimelineDate>2026 年 6 月</TimelineDate>
										<TimelineTitle>正式上线</TimelineTitle>
									</TimelineHeader>
									<TimelineIndicator />
									<TimelineSeparator />
									<TimelineContent>平台向所有用户开放。</TimelineContent>
								</TimelineItem>
							</Timeline>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Frame / IconTile / IconStack</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							<Frame>
								<FrameHeader>
									<FrameTitle>区块标题</FrameTitle>
									<FrameDescription>Frame 默认样式</FrameDescription>
								</FrameHeader>
								<FramePanel>
									<p className="text-sm text-muted-foreground">面板内容区域</p>
								</FramePanel>
								<FrameFooter>
									<p className="text-sm text-muted-foreground">页脚说明</p>
								</FrameFooter>
							</Frame>
							<div className="gap-3 flex flex-wrap items-center">
								{iconTileVariants.map((variant) => (
									<IconTile key={variant} variant={variant}>
										<SettingsIcon />
									</IconTile>
								))}
							</div>
							<IconStack>
								<FolderIcon className="size-5" />
							</IconStack>
						</CardContent>
					</Card>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>现有 @repo/ui 组件对照</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="gap-2 flex flex-wrap items-center">
							<Button variant="primary">primary</Button>
							<Button variant="secondary">secondary</Button>
							<Button variant="outline">outline</Button>
							<Button variant="ghost">ghost</Button>
							<Button variant="destructive">destructive</Button>
							<Button variant="link">link</Button>
						</div>
						<div className="gap-4 flex flex-wrap items-center">
							<Input placeholder="现有 Input 组件" className="max-w-60" />
							<Switch checked={switchOn} onCheckedChange={setSwitchOn} />
							<Rating rating={4} size="sm" />
							<Badge variant="success-light">ReUI Badge 混排</Badge>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
