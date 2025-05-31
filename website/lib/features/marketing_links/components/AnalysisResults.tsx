"use client";

import React, { useState } from "react";
import { Box, Paper, Typography, Grid, Chip, Button, Card, CardContent, CardActions, List, ListItem, ListItemText, ListItemIcon, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Alert, Link, LinearProgress } from "@mui/material";
import { TrendingUp, TrendingDown, TrendingFlat, Launch, MonetizationOn, People, Schedule, ExpandMore, ContentCopy, CheckCircle, Assignment, Analytics, CompareArrows } from "@mui/icons-material";
import { useMarketingLinks } from "../hooks/useMarketingLinks";
import { TrendKeyword, AffiliateOpportunity, ActionItem, CompetitorInsight } from "../types";

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "Rising":
      return <TrendingUp color="success" />;
    case "Declining":
      return <TrendingDown color="error" />;
    default:
      return <TrendingFlat color="warning" />;
  }
};

const getVolumeColor = (volume: string) => {
  switch (volume) {
    case "Very High":
      return "success";
    case "High":
      return "info";
    case "Medium":
      return "warning";
    default:
      return "default";
  }
};

const getCompetitionColor = (competition: string) => {
  switch (competition) {
    case "Low":
      return "success";
    case "Medium":
      return "warning";
    default:
      return "error";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "error";
    case "Medium":
      return "warning";
    default:
      return "success";
  }
};

interface KeywordCardProps {
  keyword: TrendKeyword;
}

function KeywordCard({ keyword }: KeywordCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyKeyword = () => {
    navigator.clipboard.writeText(keyword.keyword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card elevation={1} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: "bold" }}>
            {keyword.keyword}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getTrendIcon(keyword.trend)}
            <Tooltip title={copied ? "Copied!" : "Copy keyword"}>
              <IconButton size="small" onClick={handleCopyKeyword}>
                {copied ? <CheckCircle color="success" /> : <ContentCopy />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          <Chip label={`Volume: ${keyword.searchVolume}`} color={getVolumeColor(keyword.searchVolume) as any} size="small" />
          <Chip label={`Competition: ${keyword.competition}`} color={getCompetitionColor(keyword.competition) as any} size="small" />
          <Chip label={keyword.trend} variant="outlined" size="small" />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Related Queries:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {keyword.relatedQueries.slice(0, 3).map((query, index) => (
            <Chip key={index} label={query} variant="outlined" size="small" />
          ))}
        </Box>
      </CardContent>

      <CardActions>
        <Button size="small" startIcon={<Launch />} href={keyword.googleTrendsUrl} target="_blank" rel="noopener noreferrer">
          View Google Trends
        </Button>
      </CardActions>
    </Card>
  );
}

interface OpportunityCardProps {
  opportunity: AffiliateOpportunity;
}

function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card elevation={1} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" component="h3" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MonetizationOn color="primary" />
          {opportunity.keyword}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Platform:</strong> {opportunity.platform}
        </Typography>

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>Marketing Angle:</strong> {opportunity.marketingAngle}
        </Typography>

        <Typography variant="body2" color="primary" paragraph>
          <strong>Estimated Revenue:</strong> {opportunity.estimatedRevenue}
        </Typography>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Product Suggestions:
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {opportunity.productSuggestions.slice(0, 3).map((product, index) => (
            <Chip key={index} label={product} variant="outlined" size="small" />
          ))}
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2">Affiliate Programs ({opportunity.affiliatePrograms.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {opportunity.affiliatePrograms.map((program, index) => (
              <Box key={index} sx={{ mb: 2, p: 1, border: 1, borderColor: "divider", borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  {program.name} - {program.commission}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {program.description}
                </Typography>
                <Button size="small" href={program.url} target="_blank" startIcon={<Launch />}>
                  Join Program
                </Button>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
}

interface ActionPlanProps {
  actionPlan: ActionItem[];
}

function ActionPlan({ actionPlan }: ActionPlanProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (step: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(step)) {
      newCompleted.delete(step);
    } else {
      newCompleted.add(step);
    }
    setCompletedSteps(newCompleted);
  };

  const completionPercentage = (completedSteps.size / actionPlan.length) * 100;

  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Assignment color="primary" />
        Action Plan ({completedSteps.size}/{actionPlan.length} completed)
      </Typography>

      <LinearProgress variant="determinate" value={completionPercentage} sx={{ mb: 3, height: 8, borderRadius: 4 }} />

      <List>
        {actionPlan.map((item) => (
          <ListItem
            key={item.step}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              mb: 2,
              opacity: completedSteps.has(item.step) ? 0.7 : 1,
            }}
          >
            <ListItemIcon>
              <IconButton onClick={() => toggleStep(item.step)}>
                <CheckCircle color={completedSteps.has(item.step) ? "success" : "disabled"} />
              </IconButton>
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    Step {item.step}: {item.title}
                  </Typography>
                  <Chip label={item.priority} size="small" color={getPriorityColor(item.priority) as any} />
                  <Chip label={item.timeEstimate} size="small" variant="outlined" icon={<Schedule />} />
                </Box>
              }
              secondary={
                <Box>
                  <Typography variant="body2" paragraph>
                    {item.description}
                  </Typography>
                  {item.resources.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Resources:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {item.resources.map((resource, index) => (
                          <Chip key={index} label={resource} variant="outlined" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

interface CompetitorInsightsProps {
  insights: CompetitorInsight[];
}

function CompetitorInsights({ insights }: CompetitorInsightsProps) {
  return (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CompareArrows color="primary" />
        Competitor Insights
      </Typography>

      {insights.map((insight, index) => (
        <Accordion key={index}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1">{insight.keyword}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Top Competitors:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {insight.topCompetitors.map((competitor, idx) => (
                    <Chip key={idx} label={competitor} variant="outlined" size="small" />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gap Opportunities:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                  {insight.gapOpportunities.map((gap, idx) => (
                    <Chip key={idx} label={gap} color="success" variant="outlined" size="small" />
                  ))}
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Recommended Strategy:
                </Typography>
                <Typography variant="body2">{insight.recommendedStrategy}</Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
}

export default function AnalysisResults() {
  const { currentAnalysis, deleteAnalysis } = useMarketingLinks();

  if (!currentAnalysis) {
    return (
      <Paper elevation={1} sx={{ p: 3, textAlign: "center" }}>
        <Analytics sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No analysis results yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter a marketing query above to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ space: 3 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Analysis Results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Query: "{currentAnalysis.query}"
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip label={currentAnalysis.difficulty} color={currentAnalysis.difficulty === "Beginner" ? "success" : currentAnalysis.difficulty === "Intermediate" ? "warning" : "error"} />
            <Chip label={`Est. Time: ${currentAnalysis.estimatedTimeToProfit}`} variant="outlined" icon={<Schedule />} />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TrendingUp color="primary" />
          Trending Keywords ({currentAnalysis.keywords.length})
        </Typography>
        <Grid container spacing={2}>
          {currentAnalysis.keywords.map((keyword, index) => (
            <Grid key={index} size={{ xs: 12, md: 6, lg: 4 }}>
              <KeywordCard keyword={keyword} />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <MonetizationOn color="primary" />
          Affiliate Opportunities ({currentAnalysis.opportunities.length})
        </Typography>
        <Grid container spacing={2}>
          {currentAnalysis.opportunities.map((opportunity, index) => (
            <Grid key={index} size={{ xs: 12, lg: 6 }}>
              <OpportunityCard opportunity={opportunity} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {currentAnalysis.competitorInsights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <CompetitorInsights insights={currentAnalysis.competitorInsights} />
        </Box>
      )}

      {currentAnalysis.actionPlan.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <ActionPlan actionPlan={currentAnalysis.actionPlan} />
        </Box>
      )}
    </Box>
  );
}
