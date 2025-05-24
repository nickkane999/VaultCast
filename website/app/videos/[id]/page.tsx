import { Container, Typography, Card, CardContent, Rating, Box, Chip, Button } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Link from "next/link";
import VideoPlayer from "@/lib/components/VideoPlayer";

async function getVideoRecord(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  try {
    const response = await fetch(`${baseUrl}/api/videos/${id}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching video record:", error);
    return null;
  }
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const videoRecord = await getVideoRecord(id);

  if (!videoRecord) {
    return (
      <Container sx={{ py: 4 }}>
        <Link href="/videos" passHref>
          <Button startIcon={<ArrowBack />} sx={{ mb: 2 }}>
            Back to Videos
          </Button>
        </Link>
        <Typography variant="h4" gutterBottom>
          Video Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary">
          The requested video could not be found.
        </Typography>
      </Container>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getYear = (dateString: string) => {
    try {
      return new Date(dateString).getFullYear();
    } catch {
      return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Link href="/videos" passHref>
        <Button startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Back to Videos
        </Button>
      </Link>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {videoRecord.title}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          {videoRecord.score !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Rating value={videoRecord.score} readOnly max={10} />
              <Typography variant="body1" fontWeight="bold">
                {videoRecord.score}/10
              </Typography>
            </Box>
          )}

          {videoRecord.release_date && <Chip label={getYear(videoRecord.release_date)} color="primary" variant="outlined" />}
        </Box>

        {videoRecord.release_date && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Released: {formatDate(videoRecord.release_date)}
          </Typography>
        )}
      </Box>

      <VideoPlayer filename={id} />

      {videoRecord.description && (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
              {videoRecord.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mt: 2, color: "text.secondary", fontSize: "0.875rem" }}>
        <Typography variant="caption">File: {videoRecord.filename}</Typography>
      </Box>
    </Container>
  );
}
