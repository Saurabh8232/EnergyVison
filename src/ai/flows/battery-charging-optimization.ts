'use server';

/**
 * @fileOverview A flow that leverages generative AI to analyze historical battery data and predict optimal charging schedules.
 *
 * - predictOptimalChargingSchedule - A function that handles the battery charging optimization process.
 * - PredictOptimalChargingScheduleInput - The input type for the predictOptimalChargingSchedule function.
 * - PredictOptimalChargingScheduleOutput - The return type for the predictOptimalChargingSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const PredictOptimalChargingScheduleInputSchema = z.object({
  deviceId: z.string().describe('The unique identifier for the battery device.'),
  historicalBatteryData: z.string().describe('Historical data of the battery, including voltage, current, temperature, and charging cycles, in JSON format.'),
  deviceContextData: z.string().optional().describe('Additional data about the device context, such as usage patterns, environment, and workload, in JSON format.'),
});

export type PredictOptimalChargingScheduleInput = z.infer<typeof PredictOptimalChargingScheduleInputSchema>;

const PredictOptimalChargingScheduleOutputSchema = z.object({
  optimalChargingSchedule: z.string().describe('The predicted optimal charging schedule, including start time, duration, and charging rate.'),
  rationale: z.string().describe('The rationale behind the predicted optimal charging schedule.'),
  healthScore: z.number().describe('Battery health score from 0 to 100, 100 being optimal health.'),
  speech: z.string().describe('A summary of the schedule, rationale, and health score using text-to-speech.'),
});

export type PredictOptimalChargingScheduleOutput = z.infer<typeof PredictOptimalChargingScheduleOutputSchema>;

export async function predictOptimalChargingSchedule(input: PredictOptimalChargingScheduleInput): Promise<PredictOptimalChargingScheduleOutput> {
  return predictOptimalChargingScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictOptimalChargingSchedulePrompt',
  input: {
    schema: PredictOptimalChargingScheduleInputSchema,
  },
  output: {
    schema: PredictOptimalChargingScheduleOutputSchema,
  },
  prompt: `You are an expert in battery management and optimization. Analyze the provided historical battery data and device context data to predict an optimal charging schedule that maximizes battery lifespan and prevents downtime.

Historical Battery Data:
{{historicalBatteryData}}

Device Context Data (if available):
{{#if deviceContextData}}
  {{deviceContextData}}
{{else}}
  No device context data provided.
{{/if}}

Based on this information, provide the following:

1.  Optimal Charging Schedule: A detailed charging schedule including start time, duration, and charging rate.
2.  Rationale: Explain the reasoning behind the predicted schedule, considering factors such as battery health, usage patterns, and environmental conditions.
3.  Battery Health Score: Quantify the overall health of the battery on a scale of 0 to 100, where 100 represents optimal health.
4.  Speech: Use text-to-speech to make a spoken summary of the schedule, rationale, and health score.

Ensure the schedule is practical and safe for the battery. Return the optimal charging schedule, rationale, and battery health score in the specified JSON format. The 'speech' field should be a data URI.
`,
});

const predictOptimalChargingScheduleFlow = ai.defineFlow(
  {
    name: 'predictOptimalChargingScheduleFlow',
    inputSchema: PredictOptimalChargingScheduleInputSchema,
    outputSchema: PredictOptimalChargingScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
      throw new Error('No output from prompt.');
    }

    const tts = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: output.rationale,
    });

    if (tts.media) {
      const audioBuffer = Buffer.from(
        tts.media.url.substring(tts.media.url.indexOf(',') + 1),
        'base64'
      );
      const media = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

      return {
        ...output,
        speech: media,
      };
    }

    return output!;
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
